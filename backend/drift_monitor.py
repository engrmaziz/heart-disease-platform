import os
import logging
import pandas as pd
from dotenv import load_dotenv
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_baseline_data() -> pd.DataFrame:
    """Fetch and clean the UCI Cleveland dataset as the baseline."""
    logger.info("Fetching baseline data from UCI repository...")
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
    columns = [
        "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
        "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"
    ]
    try:
        df = pd.read_csv(url, names=columns, na_values="?")
        # Drop missing values
        df.dropna(inplace=True)
        # Map targets > 0 to 1
        df["target"] = df["target"].apply(lambda x: 1 if x > 0 else 0)
        logger.info(f"Baseline data fetched and cleaned successfully. Shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Failed to fetch or clean baseline data: {e}")
        raise

def get_production_data() -> pd.DataFrame:
    """Query the last 100 entries from Supabase aegis_predictions."""
    logger.info("Fetching production data from Supabase...")
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.")
        raise ValueError("Missing Supabase credentials.")
        
    if create_client is None:
        logger.error("Supabase python package is not installed.")
        raise ImportError("Please install supabase package.")

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        response = supabase.table("aegis_predictions").select("patient_data").order("created_at", desc=True).limit(100).execute()
        
        if not response.data:
            logger.warning("No production data found in the aegis_predictions table.")
            return pd.DataFrame()
            
        # Flatten the nested patient_data
        records = [row["patient_data"] for row in response.data]
        prod_df = pd.DataFrame(records)
        logger.info(f"Production data fetched successfully. Shape: {prod_df.shape}")
        return prod_df
    except Exception as e:
        logger.error(f"Error querying Supabase: {e}")
        raise

def evaluate_data_drift():
    """Run Evidently AI DataDriftPreset and enforce the 25% threshold."""
    try:
        baseline_df = get_baseline_data()
        production_df = get_production_data()
        
        if production_df.empty:
            logger.info("Insufficient production data to calculate drift. Exiting cleanly.")
            return

        # Ensure we only compare columns present in both datasets
        common_cols = list(set(baseline_df.columns).intersection(set(production_df.columns)))
        
        if "target" in common_cols:
            common_cols.remove("target") # Generally don't drift-monitor the target with input features
            
        logger.info(f"Initializing Evidently AI DataDriftPreset report for {len(common_cols)} features...")
        report = Report(metrics=[DataDriftPreset(columns=common_cols)])
        report.run(reference_data=baseline_df[common_cols], current_data=production_df[common_cols])
        
        metrics_dict = report.as_dict()
        
        # Parse drift metrics
        drift_result = metrics_dict['metrics'][0]['result']
        drifted_columns = drift_result.get('number_of_drifted_columns', 0)
        total_columns = drift_result.get('number_of_columns', len(common_cols))
        
        drift_share = drifted_columns / total_columns if total_columns > 0 else 0.0
        
        logger.info("--- Data Drift Report ---")
        logger.info(f"Total Monitored Features: {total_columns}")
        logger.info(f"Total Drifted Features: {drifted_columns}")
        logger.info(f"Overall Drift Share: {drift_share * 100:.2f}%")
        
        if drift_share > 0.25:
            logger.error(f"Drift share ({drift_share * 100:.2f}%) exceeds the 25% threshold.")
            raise AssertionError('Data Drift Threshold Violated. Production release aborted.')
            
        logger.info("Data drift is within acceptable boundaries. Proceeding.")
    except AssertionError:
        raise
    except Exception as e:
        logger.error(f"An unexpected error occurred during drift evaluation: {e}")
        raise

if __name__ == "__main__":
    evaluate_data_drift()

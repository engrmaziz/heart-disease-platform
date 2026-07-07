import os
import logging
import mlflow
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def log_training_session(metrics_dict: dict, hyperparams: dict):
    """
    Automated tracking utility for MLflow.
    Sets the active experiment, logs parameters and metrics, and enforces a performance gate.
    """
    logger.info("Initializing MLflow tracking...")
    
    tracking_uri = os.environ.get("MLFLOW_TRACKING_URI")
    username = os.environ.get("MLFLOW_TRACKING_USERNAME")
    password = os.environ.get("MLFLOW_TRACKING_PASSWORD")
    
    if not tracking_uri:
        logger.warning("MLFLOW_TRACKING_URI not set. Logging locally.")
    else:
        # Environment variables used by MLflow to authenticate natively
        if username and password:
            os.environ["MLFLOW_TRACKING_USERNAME"] = username
            os.environ["MLFLOW_TRACKING_PASSWORD"] = password
        mlflow.set_tracking_uri(tracking_uri)
    
    experiment_name = "Aegis-Heart-Disease"
    try:
        mlflow.set_experiment(experiment_name)
    except Exception as e:
        logger.error(f"Failed to set experiment '{experiment_name}': {e}")
        raise

    accuracy = metrics_dict.get("accuracy", 0.0)
    logger.info(f"Model accuracy evaluated: {accuracy:.4f}")

    if accuracy < 0.80:
        logger.error(f"Performance gate triggered. Accuracy {accuracy:.4f} is below threshold.")
        raise ValueError('Deployment Gate Denied: Baseline accuracy below production threshold.')

    try:
        with mlflow.start_run():
            mlflow.log_params(hyperparams)
            mlflow.log_metrics(metrics_dict)
            logger.info("Successfully logged hyperparameters and metrics to MLflow.")
    except Exception as e:
        logger.error(f"Error during MLflow logging: {e}")
        raise

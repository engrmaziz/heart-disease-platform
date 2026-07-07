"""
Test the exported heart disease model on the original UCI dataset.

Usage (local):
    python test_model.py                              # uses default path
    python test_model.py --model path/to/model.pkl    # custom path

Usage (Colab):
    %run test_model.py
"""

import argparse
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
)


# ── Configuration ───────────────────────────────────────────────────────────
DEFAULT_MODEL_PATH = "heart_disease_model.pkl"
DATASET_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
COLUMN_NAMES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target",
]


def load_dataset() -> pd.DataFrame:
    """Download and prepare the UCI Heart Disease dataset."""
    df = pd.read_csv(DATASET_URL, header=None, names=COLUMN_NAMES, na_values="?")
    df["target"] = (df["target"] > 0).astype(int)
    for col in df.columns:
        if df[col].isnull().any():
            df[col].fillna(df[col].median(), inplace=True)
    for col in ["ca", "thal"]:
        df[col] = df[col].astype(int)
    return df


def main():
    parser = argparse.ArgumentParser(description="Test heart disease model accuracy")
    parser.add_argument(
        "--model", type=str, default=DEFAULT_MODEL_PATH,
        help=f"Path to the .pkl model file (default: {DEFAULT_MODEL_PATH})",
    )
    args = parser.parse_args()

    model_path = Path(args.model)
    if not model_path.exists():
        print(f"❌ Model file not found: {model_path}")
        sys.exit(1)

    # ── Load model ──────────────────────────────────────────────────────
    print(f"📦 Loading model from: {model_path}")
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    print(f"   Type     : {type(model).__name__}")
    print(f"   Features : {getattr(model, 'n_features_in_', '?')}")
    print(f"   Steps    : {[s[0] for s in model.steps] if hasattr(model, 'steps') else 'N/A'}")

    # ── Load data ───────────────────────────────────────────────────────
    print("\n📊 Downloading UCI Heart Disease dataset …")
    df = load_dataset()
    X = df.drop("target", axis=1)
    y = df["target"]
    print(f"   Samples: {len(df)}  |  Positive: {y.sum()}  |  Negative: {(y == 0).sum()}")

    # ── Predict on full dataset ─────────────────────────────────────────
    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)[:, 1]

    accuracy  = accuracy_score(y, y_pred)
    precision = precision_score(y, y_pred)
    recall    = recall_score(y, y_pred)
    f1        = f1_score(y, y_pred)
    auc       = roc_auc_score(y, y_proba)

    print("\n" + "=" * 55)
    print("         📊 MODEL ACCURACY REPORT (Full Dataset)")
    print("=" * 55)
    print(f"  Accuracy  : {accuracy:.4f}  {'✅' if accuracy >= 0.80 else '⚠️'}")
    print(f"  Precision : {precision:.4f}")
    print(f"  Recall    : {recall:.4f}")
    print(f"  F1-Score  : {f1:.4f}")
    print(f"  ROC-AUC   : {auc:.4f}")
    print("=" * 55)

    print("\n📝 Classification Report:")
    print(classification_report(y, y_pred, target_names=["No Disease", "Disease"]))

    # ── Spot-check individual predictions ───────────────────────────────
    print("🔬 Spot-check (first 10 samples):")
    for i in range(min(10, len(X))):
        pred = y_pred[i]
        conf = y_proba[i] if pred == 1 else 1 - y_proba[i]
        actual = y.iloc[i]
        status = "✅" if pred == actual else "❌"
        label = "Disease" if pred == 1 else "Healthy"
        print(f"  {status}  #{i+1:3d}  pred={label:<10s}  conf={conf:.2%}  actual={'Disease' if actual else 'Healthy'}")

    # ── Pass / Fail gate ────────────────────────────────────────────────
    ACCURACY_THRESHOLD = 0.80
    print(f"\n{'🎉 PASSED' if accuracy >= ACCURACY_THRESHOLD else '🚨 FAILED'}: "
          f"accuracy {accuracy:.4f} vs threshold {ACCURACY_THRESHOLD}")

    return 0 if accuracy >= ACCURACY_THRESHOLD else 1


if __name__ == "__main__":
    sys.exit(main())

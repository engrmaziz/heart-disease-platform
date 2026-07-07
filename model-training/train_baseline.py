# =============================================================================
# Heart Disease Baseline Model Training — Google Colab Script
# =============================================================================
# Copy each "# %%" cell block into a separate Colab cell, or upload the whole
# file and run it as-is with `%run train_baseline.py`.
#
# Output: heart_disease_model.pkl  (sklearn Pipeline — best of RF vs XGBoost)
# =============================================================================

# %% [markdown]
# # 🫀 Heart Disease Classification — Baseline Model
# **Goal**: Train a highly accurate binary classifier on the UCI Heart Disease
# dataset. No MLOps plumbing — just a clean, reproducible baseline.

# %% ── Install dependencies (Colab already has most of these) ───────────────
# !pip install -q xgboost scikit-learn pandas numpy matplotlib seaborn

# %% ── Imports ──────────────────────────────────────────────────────────────
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from pathlib import Path

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score,
    GridSearchCV,
)
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    RocCurveDisplay,
)

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    print("⚠️  xgboost not installed — will train Random Forest only.")
    print("   Run: pip install xgboost")
    HAS_XGB = False

print("✅ All imports successful")

# %% ── 1. Download & Load the UCI Heart Disease Dataset ─────────────────────
URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"

COLUMN_NAMES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target",
]

df = pd.read_csv(URL, header=None, names=COLUMN_NAMES, na_values="?")

# The original target is multi-class (0-4). Convert to binary:
#   0 = no disease, 1-4 = disease present → 1
df["target"] = (df["target"] > 0).astype(int)

print(f"📊 Dataset shape: {df.shape}")
print(f"   Positive (disease): {df['target'].sum()}  |  Negative: {(df['target'] == 0).sum()}")
print(f"   Missing values:\n{df.isnull().sum()[df.isnull().sum() > 0]}")
df.head()

# %% ── 2. Handle Missing Values ────────────────────────────────────────────
# 'ca' and 'thal' have a few missing values in the Cleveland dataset.
# Impute with median (simple & effective for a baseline).
for col in df.columns:
    if df[col].isnull().any():
        median_val = df[col].median()
        df[col].fillna(median_val, inplace=True)
        print(f"   Imputed '{col}' missing values with median = {median_val}")

# Force integer types for categorical columns
for col in ["ca", "thal"]:
    df[col] = df[col].astype(int)

print(f"\n✅ Missing values after imputation: {df.isnull().sum().sum()}")

# %% ── 3. Exploratory Data Analysis ────────────────────────────────────────
fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle("Feature Distributions by Heart Disease Status", fontsize=16, fontweight="bold")

features_to_plot = ["age", "trestbps", "chol", "thalach", "oldpeak", "ca"]
colors = ["#2ecc71", "#e74c3c"]

for ax, feat in zip(axes.ravel(), features_to_plot):
    for label, color in zip([0, 1], colors):
        subset = df[df["target"] == label][feat]
        ax.hist(subset, bins=20, alpha=0.6, color=color,
                label="No Disease" if label == 0 else "Disease")
    ax.set_title(feat, fontsize=13, fontweight="bold")
    ax.legend(fontsize=9)

plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig("eda_distributions.png", dpi=150, bbox_inches="tight")
plt.show()
print("📈 Saved: eda_distributions.png")

# Correlation heatmap
plt.figure(figsize=(12, 9))
corr = df.corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap="RdBu_r",
            center=0, square=True, linewidths=0.5)
plt.title("Feature Correlation Matrix", fontsize=15, fontweight="bold")
plt.tight_layout()
plt.savefig("eda_correlation.png", dpi=150, bbox_inches="tight")
plt.show()
print("📈 Saved: eda_correlation.png")

# %% ── 4. Prepare Features & Split ─────────────────────────────────────────
X = df.drop("target", axis=1)
y = df["target"]

FEATURE_NAMES = list(X.columns)
print(f"📋 Features ({len(FEATURE_NAMES)}): {FEATURE_NAMES}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y,
)
print(f"   Train: {X_train.shape[0]}  |  Test: {X_test.shape[0]}")

# %% ── 5. Define Candidate Pipelines ───────────────────────────────────────
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

candidates = {}

# ── Random Forest ──
rf_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(random_state=42)),
])

rf_params = {
    "clf__n_estimators": [200, 400, 600],
    "clf__max_depth": [6, 10, 15, None],
    "clf__min_samples_split": [2, 5],
    "clf__min_samples_leaf": [1, 2],
    "clf__max_features": ["sqrt", "log2"],
}

print("\n🔍 Tuning Random Forest …")
rf_search = GridSearchCV(
    rf_pipeline, rf_params, cv=cv, scoring="accuracy",
    n_jobs=-1, verbose=0, refit=True,
)
rf_search.fit(X_train, y_train)
candidates["RandomForest"] = rf_search

print(f"   Best CV accuracy: {rf_search.best_score_:.4f}")
print(f"   Best params: {rf_search.best_params_}")

# ── XGBoost ──
if HAS_XGB:
    xgb_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", XGBClassifier(
            use_label_encoder=False,
            eval_metric="logloss",
            random_state=42,
            verbosity=0,
        )),
    ])

    xgb_params = {
        "clf__n_estimators": [200, 400, 600],
        "clf__max_depth": [3, 5, 7],
        "clf__learning_rate": [0.01, 0.05, 0.1],
        "clf__subsample": [0.8, 1.0],
        "clf__colsample_bytree": [0.8, 1.0],
    }

    print("\n🔍 Tuning XGBoost …")
    xgb_search = GridSearchCV(
        xgb_pipeline, xgb_params, cv=cv, scoring="accuracy",
        n_jobs=-1, verbose=0, refit=True,
    )
    xgb_search.fit(X_train, y_train)
    candidates["XGBoost"] = xgb_search

    print(f"   Best CV accuracy: {xgb_search.best_score_:.4f}")
    print(f"   Best params: {xgb_search.best_params_}")

# %% ── 6. Select the Best Model ────────────────────────────────────────────
best_name = max(candidates, key=lambda k: candidates[k].best_score_)
best_model = candidates[best_name].best_estimator_
best_cv_score = candidates[best_name].best_score_

print(f"\n🏆 Champion model: {best_name}")
print(f"   Cross-validated accuracy: {best_cv_score:.4f}")

# %% ── 7. Evaluate on Hold-Out Test Set ────────────────────────────────────
y_pred = best_model.predict(X_test)
y_proba = best_model.predict_proba(X_test)[:, 1]

test_accuracy  = accuracy_score(y_test, y_pred)
test_precision = precision_score(y_test, y_pred)
test_recall    = recall_score(y_test, y_pred)
test_f1        = f1_score(y_test, y_pred)
test_auc       = roc_auc_score(y_test, y_proba)

print("\n" + "=" * 55)
print("         📊 HOLD-OUT TEST SET RESULTS")
print("=" * 55)
print(f"  Accuracy  : {test_accuracy:.4f}")
print(f"  Precision : {test_precision:.4f}")
print(f"  Recall    : {test_recall:.4f}")
print(f"  F1-Score  : {test_f1:.4f}")
print(f"  ROC-AUC   : {test_auc:.4f}")
print("=" * 55)

print("\n📝 Classification Report:")
print(classification_report(y_test, y_pred, target_names=["No Disease", "Disease"]))

# ── Confusion Matrix ──
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

ConfusionMatrixDisplay.from_predictions(
    y_test, y_pred,
    display_labels=["No Disease", "Disease"],
    cmap="Blues", ax=axes[0],
)
axes[0].set_title("Confusion Matrix", fontsize=13, fontweight="bold")

RocCurveDisplay.from_predictions(
    y_test, y_proba,
    name=best_name, ax=axes[1],
    color="#e74c3c", lw=2,
)
axes[1].plot([0, 1], [0, 1], "k--", lw=1, alpha=0.5)
axes[1].set_title("ROC Curve", fontsize=13, fontweight="bold")

plt.tight_layout()
plt.savefig("test_results.png", dpi=150, bbox_inches="tight")
plt.show()
print("📈 Saved: test_results.png")

# %% ── 8. Export the Model ──────────────────────────────────────────────────
MODEL_FILENAME = "heart_disease_model.pkl"

with open(MODEL_FILENAME, "wb") as f:
    pickle.dump(best_model, f, protocol=pickle.HIGHEST_PROTOCOL)

file_size = Path(MODEL_FILENAME).stat().st_size / 1024
print(f"\n💾 Model saved: {MODEL_FILENAME}  ({file_size:.1f} KB)")
print(f"   Pipeline steps: {[step[0] for step in best_model.steps]}")
print(f"   Feature names : {list(best_model.feature_names_in_)}")
print(f"   Classes       : {list(best_model.classes_)}")

# For Colab — download the file automatically
try:
    from google.colab import files
    files.download(MODEL_FILENAME)
    print("📥 Download triggered in Colab")
except ImportError:
    print("   (Not running in Colab — file saved to working directory)")

# %% ── 9. Quick Sanity Test ─────────────────────────────────────────────────
print("\n" + "=" * 55)
print("         🧪 SANITY CHECK — Reload & Predict")
print("=" * 55)

with open(MODEL_FILENAME, "rb") as f:
    loaded_model = pickle.load(f)

# Use the first 5 test samples
sample = X_test.head(5)
predictions = loaded_model.predict(sample)
probabilities = loaded_model.predict_proba(sample)

for i, (idx, row) in enumerate(sample.iterrows()):
    pred = predictions[i]
    conf = probabilities[i][pred]
    actual = y_test.iloc[sample.index.get_loc(idx)]
    status = "✅" if pred == actual else "❌"
    label = "Disease" if pred == 1 else "No Disease"
    print(f"  {status} Sample {i+1}: predicted={label} (conf={conf:.2%})  actual={'Disease' if actual else 'No Disease'}")

reload_acc = accuracy_score(y_test, loaded_model.predict(X_test))
print(f"\n  Reloaded model test accuracy: {reload_acc:.4f}")
assert reload_acc == test_accuracy, "⚠️ Accuracy mismatch after reload!"
print("  ✅ Serialization integrity verified — model is production-ready")

# %% [markdown]
# ## ✅ Done!
#
# **Next steps:**
# 1. Download `heart_disease_model.pkl` and place it in your `backend/` folder
# 2. The FastAPI app will load it automatically on startup
# 3. Test via `POST /predict` with the 13 feature fields

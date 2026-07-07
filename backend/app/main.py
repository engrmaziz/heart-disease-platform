"""
FastAPI application for Heart Disease Classification.

Loads a pre-trained sklearn Pipeline (StandardScaler → RandomForestClassifier)
and exposes a strictly-validated POST /predict endpoint.
"""
import os
import pickle
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import HeartDiseaseInput, HeartDiseaseResult, HealthCheckResponse
from app.llm import generate_clinical_insight

# ---------------------------------------------------------------------------
# Globals & Constants
# ---------------------------------------------------------------------------
# Resolve the base directory (one level up from the 'app' folder)
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "heart_disease_model.pkl"

# Strict column ordering required by the Scikit-Learn Pipeline
FEATURE_ORDER = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", 
    "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]
# ---------------------------------------------------------------------------


try:
    from supabase import create_client, Client
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_KEY", "")
    supabase: Client | None = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
except ImportError:
    supabase = None

security = HTTPBearer()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("heart-disease-api")

# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Lifespan – load model once at startup
# ---------------------------------------------------------------------------
def _load_model():
    """Deserialize the sklearn pipeline from disk."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    with open(MODEL_PATH, "rb") as fh:
        model = pickle.load(fh)
    logger.info(
        "Model loaded  ✔  type=%s  features=%d  classes=%s",
        type(model).__name__,
        getattr(model, "n_features_in_", "?"),
        getattr(model, "classes_", "?"),
    )
    return model


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model into app state on startup; clean up on shutdown."""
    app.state.model = _load_model()
    logger.info("Startup complete – model ready to serve predictions")
    yield
    logger.info("Shutting down – releasing model resources")
    del app.state.model


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Heart Disease Classification API",
    description=(
        "Production-grade REST API for binary heart-disease classification "
        "powered by a scikit-learn RandomForest pipeline. "
        "All inputs are strictly validated via Pydantic with clinical-range constraints."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – allow local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _risk_level(prediction: int, confidence: float) -> str:
    """Map model output to a human-readable risk category."""
    if prediction == 0:
        return "Low Risk" if confidence >= 0.75 else "Borderline – No Disease Indicated"
    # prediction == 1
    if confidence >= 0.85:
        return "High Risk"
    if confidence >= 0.65:
        return "Moderate Risk"
    return "Elevated – Further Testing Recommended"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["Operational"],
    summary="Liveness / readiness probe",
)
async def health_check():
    """Returns service health and confirms the model is loaded."""
    model = getattr(app.state, "model", None)
    return HealthCheckResponse(
        status="healthy" if model is not None else "degraded",
        model_loaded=model is not None,
        model_features=getattr(model, "n_features_in_", 0),
    )


@app.post(
    "/predict",
    response_model=HeartDiseaseResult,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"],
    summary="Classify heart disease risk",
    responses={
        422: {"description": "Validation error – input failed Pydantic constraints"},
        503: {"description": "Model not loaded or prediction error"},
    },
)
async def predict(payload: HeartDiseaseInput):
    """
    Accept a patient record, run it through the trained sklearn pipeline,
    and return the binary prediction with a confidence probability.

    The 13 input features are **strictly validated** against clinical
    ranges before the model ever sees them.
    """
    model = getattr(app.state, "model", None)
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Check /health for diagnostics.",
        )

    # Build a single-row DataFrame in the exact feature order the model expects
    row = {feat: getattr(payload, feat) for feat in FEATURE_ORDER}
    df = pd.DataFrame([row], columns=FEATURE_ORDER)

    try:
        prediction: int = int(model.predict(df)[0])
        probabilities: np.ndarray = model.predict_proba(df)[0]
        confidence: float = round(float(probabilities[prediction]), 4)
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Prediction error: {exc}",
        )

    risk = _risk_level(prediction, confidence)

    logger.info(
        "Prediction served  →  class=%d  confidence=%.4f  risk=%s",
        prediction, confidence, risk,
    )

    # Generate clinical insight via Groq
    insight = await generate_clinical_insight(
        patient_data=row,
        prediction_result={"prediction": prediction, "confidence": confidence, "risk_level": risk}
    )

    return HeartDiseaseResult(
        prediction=prediction,
        confidence=confidence,
        risk_level=risk,
        clinical_insight=insight,
    )

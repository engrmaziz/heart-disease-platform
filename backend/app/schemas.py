"""
Pydantic schemas for strict request/response validation.

All 13 features from the UCI Heart Disease dataset are validated
with clinical-range constraints so garbage data never reaches the model.
"""

from pydantic import BaseModel, Field
from enum import IntEnum


# ---------------------------------------------------------------------------
# Enum constraints for categorical features
# ---------------------------------------------------------------------------

class Sex(IntEnum):
    FEMALE = 0
    MALE = 1


class ChestPainType(IntEnum):
    TYPICAL_ANGINA = 0
    ATYPICAL_ANGINA = 1
    NON_ANGINAL_PAIN = 2
    ASYMPTOMATIC = 3


class FastingBloodSugar(IntEnum):
    BELOW_120 = 0
    ABOVE_120 = 1


class RestingECG(IntEnum):
    NORMAL = 0
    ST_T_ABNORMALITY = 1
    LEFT_VENTRICULAR_HYPERTROPHY = 2


class ExerciseAngina(IntEnum):
    NO = 0
    YES = 1


class STSlope(IntEnum):
    UPSLOPING = 0
    FLAT = 1
    DOWNSLOPING = 2


class Thalassemia(IntEnum):
    NORMAL = 0
    FIXED_DEFECT = 1
    REVERSABLE_DEFECT = 2
    OTHER = 3


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class HeartDiseaseInput(BaseModel):
    """Strictly validated input for the heart-disease prediction endpoint."""

    age: int = Field(
        ..., ge=1, le=120,
        description="Patient age in years",
        examples=[54],
    )
    sex: Sex = Field(
        ...,
        description="Biological sex (0 = female, 1 = male)",
        examples=[1],
    )
    cp: ChestPainType = Field(
        ...,
        description="Chest pain type (0-3)",
        examples=[2],
    )
    trestbps: int = Field(
        ..., ge=50, le=300,
        description="Resting blood pressure in mm Hg on admission",
        examples=[130],
    )
    chol: int = Field(
        ..., ge=50, le=600,
        description="Serum cholesterol in mg/dl",
        examples=[250],
    )
    fbs: FastingBloodSugar = Field(
        ...,
        description="Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)",
        examples=[0],
    )
    restecg: RestingECG = Field(
        ...,
        description="Resting electrocardiographic results (0-2)",
        examples=[0],
    )
    thalach: int = Field(
        ..., ge=50, le=250,
        description="Maximum heart rate achieved during exercise",
        examples=[150],
    )
    exang: ExerciseAngina = Field(
        ...,
        description="Exercise induced angina (1 = yes, 0 = no)",
        examples=[0],
    )
    oldpeak: float = Field(
        ..., ge=0.0, le=10.0,
        description="ST depression induced by exercise relative to rest",
        examples=[1.5],
    )
    slope: STSlope = Field(
        ...,
        description="Slope of the peak exercise ST segment (0-2)",
        examples=[1],
    )
    ca: int = Field(
        ..., ge=0, le=4,
        description="Number of major vessels coloured by fluoroscopy (0-4)",
        examples=[0],
    )
    thal: Thalassemia = Field(
        ...,
        description="Thalassemia type (0-3)",
        examples=[2],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "age": 54,
                    "sex": 1,
                    "cp": 2,
                    "trestbps": 130,
                    "chol": 250,
                    "fbs": 0,
                    "restecg": 0,
                    "thalach": 150,
                    "exang": 0,
                    "oldpeak": 1.5,
                    "slope": 1,
                    "ca": 0,
                    "thal": 2,
                }
            ]
        }
    }


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------

class HeartDiseaseResult(BaseModel):
    """Prediction result returned by the /predict endpoint."""

    prediction: int = Field(
        ...,
        description="Binary classification (0 = no heart disease, 1 = heart disease detected)",
        examples=[1],
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0,
        description="Model confidence probability for the predicted class",
        examples=[0.87],
    )
    risk_level: str = Field(
        ...,
        description="Human-readable risk category derived from the confidence score",
        examples=["High Risk"],
    )
    clinical_insight: str | None = Field(
        default=None,
        description="Concise clinical summary from an expert cardiologist LLM",
        examples=["The patient's elevated resting blood pressure and age increase their cardiovascular risk. A lifestyle intervention is recommended."],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "prediction": 1,
                    "confidence": 0.87,
                    "risk_level": "High Risk",
                    "clinical_insight": "The patient's elevated resting blood pressure and age increase their cardiovascular risk. A lifestyle intervention is recommended.",
                }
            ]
        }
    }


class HealthCheckResponse(BaseModel):
    """Response for the /health liveness probe."""

    status: str = Field(..., examples=["healthy"])
    model_loaded: bool = Field(..., examples=[True])
    model_features: int = Field(..., examples=[13])

/**
 * TypeScript interfaces mirroring the FastAPI Pydantic schemas.
 * Keeps frontend types in perfect sync with backend validation.
 */

// ─── Enum maps (for select dropdowns) ─────────────────────────────────────

export const SEX_OPTIONS = [
  { value: 0, label: "Female" },
  { value: 1, label: "Male" },
] as const;

export const CHEST_PAIN_OPTIONS = [
  { value: 0, label: "Typical Angina" },
  { value: 1, label: "Atypical Angina" },
  { value: 2, label: "Non-Anginal Pain" },
  { value: 3, label: "Asymptomatic" },
] as const;

export const FBS_OPTIONS = [
  { value: 0, label: "≤ 120 mg/dl" },
  { value: 1, label: "> 120 mg/dl" },
] as const;

export const RESTING_ECG_OPTIONS = [
  { value: 0, label: "Normal" },
  { value: 1, label: "ST-T Wave Abnormality" },
  { value: 2, label: "Left Ventricular Hypertrophy" },
] as const;

export const EXERCISE_ANGINA_OPTIONS = [
  { value: 0, label: "No" },
  { value: 1, label: "Yes" },
] as const;

export const ST_SLOPE_OPTIONS = [
  { value: 0, label: "Upsloping" },
  { value: 1, label: "Flat" },
  { value: 2, label: "Downsloping" },
] as const;

export const THAL_OPTIONS = [
  { value: 0, label: "Normal" },
  { value: 1, label: "Fixed Defect" },
  { value: 2, label: "Reversible Defect" },
  { value: 3, label: "Other" },
] as const;

// ─── Request payload ──────────────────────────────────────────────────────

export interface HeartDiseaseInput {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

// ─── Response payload ─────────────────────────────────────────────────────

export interface PredictionResult {
  prediction: number;
  confidence: number;
  risk_level: string;
  clinical_insight?: string | null;
}

// ─── Validation error from FastAPI 422 ────────────────────────────────────

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationErrorDetail[];
}

// ─── Field metadata for form generation ───────────────────────────────────

export interface FieldMeta {
  name: keyof HeartDiseaseInput;
  label: string;
  type: "number" | "select";
  group: string;
  tooltip: string;
  min?: number;
  max?: number;
  step?: number;
  options?: readonly { value: number; label: string }[];
}

export const FORM_FIELDS: FieldMeta[] = [
  // Patient Demographics
  { name: "age", label: "Age", type: "number", group: "Patient Demographics", tooltip: "Patient age in years", min: 1, max: 120, step: 1 },
  { name: "sex", label: "Biological Sex", type: "select", group: "Patient Demographics", tooltip: "Biological sex of the patient", options: SEX_OPTIONS },

  // Cardiac Indicators
  { name: "cp", label: "Chest Pain Type", type: "select", group: "Cardiac Indicators", tooltip: "Type of chest pain experienced", options: CHEST_PAIN_OPTIONS },
  { name: "trestbps", label: "Resting Blood Pressure", type: "number", group: "Cardiac Indicators", tooltip: "Resting blood pressure (mm Hg) on admission", min: 50, max: 300, step: 1 },
  { name: "chol", label: "Serum Cholesterol", type: "number", group: "Cardiac Indicators", tooltip: "Serum cholesterol in mg/dl", min: 50, max: 600, step: 1 },
  { name: "fbs", label: "Fasting Blood Sugar", type: "select", group: "Cardiac Indicators", tooltip: "Fasting blood sugar > 120 mg/dl", options: FBS_OPTIONS },
  { name: "restecg", label: "Resting ECG", type: "select", group: "Cardiac Indicators", tooltip: "Resting electrocardiographic results", options: RESTING_ECG_OPTIONS },

  // Exercise Metrics
  { name: "thalach", label: "Max Heart Rate", type: "number", group: "Exercise Metrics", tooltip: "Maximum heart rate achieved during exercise", min: 50, max: 250, step: 1 },
  { name: "exang", label: "Exercise-Induced Angina", type: "select", group: "Exercise Metrics", tooltip: "Exercise induced angina", options: EXERCISE_ANGINA_OPTIONS },
  { name: "oldpeak", label: "ST Depression (Oldpeak)", type: "number", group: "Exercise Metrics", tooltip: "ST depression induced by exercise relative to rest", min: 0, max: 10, step: 0.1 },
  { name: "slope", label: "ST Slope", type: "select", group: "Exercise Metrics", tooltip: "Slope of peak exercise ST segment", options: ST_SLOPE_OPTIONS },

  // Diagnostic Results
  { name: "ca", label: "Major Vessels (Fluoroscopy)", type: "number", group: "Diagnostic Results", tooltip: "Number of major vessels coloured by fluoroscopy (0-4)", min: 0, max: 4, step: 1 },
  { name: "thal", label: "Thalassemia", type: "select", group: "Diagnostic Results", tooltip: "Thalassemia type", options: THAL_OPTIONS },
];

"use client";

import React from "react";
import { useState, useCallback } from "react";
import type { HeartDiseaseInput, PredictionResult } from "@/lib/types";
import { FORM_FIELDS } from "@/lib/types";
import { predictHeartDisease, ApiError } from "@/lib/api";
import FormField from "./FormField";
import PredictionResultCard from "./PredictionResult";

/** Form values allow empty strings for unset fields */
type FormValues = Record<keyof HeartDiseaseInput, number | string>;

const INITIAL_VALUES: FormValues = {
  age: "",
  sex: "",
  cp: "",
  trestbps: "",
  chol: "",
  fbs: "",
  restecg: "",
  thalach: "",
  exang: "",
  oldpeak: "",
  slope: "",
  ca: "",
  thal: "",
};

export default function PatientForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof HeartDiseaseInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleChange = useCallback((name: keyof HeartDiseaseInput, value: number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setApiError(null);
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof HeartDiseaseInput, string>> = {};

    for (const field of FORM_FIELDS) {
      const val = values[field.name];
      if (val === "" || val === undefined || val === null || isNaN(Number(val))) {
        newErrors[field.name] = `${field.label} is required`;
        continue;
      }
      const num = Number(val);
      if (field.min !== undefined && num < field.min) {
        newErrors[field.name] = `Minimum value is ${field.min}`;
      }
      if (field.max !== undefined && num > field.max) {
        newErrors[field.name] = `Maximum value is ${field.max}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Build the typed payload only after validation passes */
  const toPayload = (): HeartDiseaseInput => {
    const out: Record<string, number> = {};
    for (const key of Object.keys(values) as (keyof HeartDiseaseInput)[]) {
      out[key] = Number(values[key]);
    }
    return out as unknown as HeartDiseaseInput;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const prediction = await predictHeartDisease(toPayload());
      setResult(prediction);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.body && typeof err.body === "object" && "detail" in err.body) {
          const details = (err.body as { detail: Array<{ loc: (string | number)[]; msg: string }> }).detail;
          const fieldErrors: Partial<Record<keyof HeartDiseaseInput, string>> = {};
          for (const d of details) {
            const fieldName = d.loc[d.loc.length - 1] as keyof HeartDiseaseInput;
            fieldErrors[fieldName] = d.msg;
          }
          setErrors(fieldErrors);
        } else {
          setApiError(`Server error (${err.status}): ${err.statusText}`);
        }
      } else {
        setApiError("Unable to connect to the prediction server. Please ensure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setApiError(null);
    setResult(null);
  };

  // Group fields by section
  const groups = FORM_FIELDS.reduce<Record<string, typeof FORM_FIELDS>>((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {});

  const groupIcons: Record<string, React.JSX.Element> = {
    "Patient Demographics": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    "Cardiac Indicators": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    "Exercise Metrics": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    "Diagnostic Results": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      {/* ── Form Column ── */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div
            key={groupName}
            className="bg-white dark:bg-charcoal-700 rounded-2xl border border-warm-200 dark:border-charcoal-600 shadow-sm dark:shadow-none overflow-hidden"
          >
            {/* Section header */}
            <div className="px-5 py-3.5 border-b border-warm-100 dark:border-charcoal-600 bg-warm-50/50 dark:bg-charcoal-750/50">
              <div className="flex items-center gap-2.5">
                <div className="text-sage-600 dark:text-sage-400">
                  {groupIcons[groupName]}
                </div>
                <h2 className="text-sm font-semibold text-warm-800 dark:text-warm-100 tracking-tight">
                  {groupName}
                </h2>
              </div>
            </div>

            {/* Fields grid */}
            <div className="p-5">
              <div className={`grid gap-4 ${
                fields.length === 2 ? "grid-cols-1 sm:grid-cols-2" : 
                fields.length >= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                "grid-cols-1 sm:grid-cols-2"
              }`}>
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    onChange={handleChange}
                    error={errors[field.name]}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* API error toast */}
        {apiError && (
          <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4 flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{apiError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`
              relative flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-semibold
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:ring-offset-2 dark:focus:ring-offset-charcoal-800
              ${loading
                ? "bg-sage-400 dark:bg-sage-700 text-white cursor-not-allowed"
                : "bg-sage-600 hover:bg-sage-700 dark:bg-sage-600 dark:hover:bg-sage-500 text-white shadow-sm hover:shadow-md active:scale-[0.98]"
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </span>
            ) : (
              "Run Assessment"
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 rounded-xl text-sm font-medium
              text-warm-600 dark:text-warm-300
              bg-warm-100 dark:bg-charcoal-600
              hover:bg-warm-200 dark:hover:bg-charcoal-500
              border border-warm-200 dark:border-charcoal-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-warm-300/50"
          >
            Reset
          </button>
        </div>
      </form>

      {/* ── Result Column ── */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-24">
          <PredictionResultCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
}

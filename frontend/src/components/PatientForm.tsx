"use client";

import React, { useState, useCallback } from "react";
import type { HeartDiseaseInput, PredictionResult } from "@/lib/types";
import { FORM_FIELDS } from "@/lib/types";
import { predictHeartDisease, ApiError } from "@/lib/api";
import FormField from "./FormField";
import PredictionResultCard from "./PredictionResult";

type FormValues = Record<keyof HeartDiseaseInput, number | string>;

const INITIAL_VALUES: FormValues = {
  age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "", restecg: "", thalach: "", exang: "", oldpeak: "", slope: "", ca: "", thal: "",
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
        newErrors[field.name] = "Required";
        continue;
      }
      const num = Number(val);
      if (field.min !== undefined && num < field.min) newErrors[field.name] = `Min ${field.min}`;
      if (field.max !== undefined && num > field.max) newErrors[field.name] = `Max ${field.max}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toPayload = (): HeartDiseaseInput => {
    const out: Record<string, number> = {};
    for (const key of Object.keys(values) as (keyof HeartDiseaseInput)[]) out[key] = Number(values[key]);
    return out as unknown as HeartDiseaseInput;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError(null); setResult(null);
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
          setApiError(`Server error (${err.status})`);
        }
      } else {
        setApiError("Unable to connect to the prediction server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES); setErrors({}); setApiError(null); setResult(null);
  };

  const groups = FORM_FIELDS.reduce<Record<string, typeof FORM_FIELDS>>((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      {/* ── Form Column ── */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-12">
        {Object.entries(groups).map(([groupName, fields]) => (
          <div key={groupName} className="space-y-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-950 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
              {fields.map((field) => (
                <FormField key={field.name} field={field} value={values[field.name]} onChange={handleChange} error={errors[field.name]} />
              ))}
            </div>
          </div>
        ))}

        {apiError && (
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-sm font-medium text-red-600 dark:text-red-400">
            {apiError}
          </div>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="submit"
            disabled={loading}
            className={`
              flex-1 py-4 text-[13px] font-bold tracking-widest uppercase transition-all duration-300
              ${loading
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.99]"
              }
            `}
          >
            {loading ? "Analyzing..." : "Analyze Patient"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="py-4 px-8 text-[13px] font-bold tracking-widest uppercase text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {/* ── Result Column ── */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <PredictionResultCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
}

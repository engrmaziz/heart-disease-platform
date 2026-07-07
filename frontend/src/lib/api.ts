/**
 * Type-safe API client for the Heart Disease FastAPI backend.
 */

import type { HeartDiseaseInput, PredictionResult, ValidationErrorResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: ValidationErrorResponse | unknown,
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * Send patient data to the backend and receive a heart-disease prediction.
 */
export async function predictHeartDisease(
  input: HeartDiseaseInput,
): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  return response.json() as Promise<PredictionResult>;
}

/**
 * Check backend health status.
 */
export async function checkHealth(): Promise<{ status: string; model_loaded: boolean; model_features: number }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  return response.json();
}

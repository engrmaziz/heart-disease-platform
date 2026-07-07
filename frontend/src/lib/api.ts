/**
 * Type-safe API client for the Heart Disease FastAPI backend.
 */

import type { HeartDiseaseInput, PredictionResult, ValidationErrorResponse } from "./types";
import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers,
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

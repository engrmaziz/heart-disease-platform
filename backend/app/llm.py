"""
LLM integration for generating clinical insights.
"""
import os
import logging
from groq import AsyncGroq

logger = logging.getLogger("heart-disease-api")

# The client will automatically use os.environ.get("GROQ_API_KEY")
try:
    client = AsyncGroq()
except Exception as e:
    logger.warning("Failed to initialize AsyncGroq client. Check GROQ_API_KEY environment variable. Error: %s", e)
    client = None


async def generate_clinical_insight(patient_data: dict, prediction_result: dict) -> str:
    """
    Calls the Groq API to generate a concise, 3-sentence clinical summary
    acting as an expert cardiologist.
    """
    if not client:
        logger.warning("Groq client not initialized, skipping clinical insight generation.")
        return "Clinical insight unavailable (LLM service disabled)."

    prompt = (
        "You are an expert cardiologist. Review the following patient vitals and the machine learning model's risk prediction.\n"
        "Provide a concise, 3-sentence clinical summary and recommendation.\n"
        "Focus on the most critical risk factors and avoid unnecessary jargon.\n\n"
        f"Patient Vitals:\n{patient_data}\n\n"
        f"Model Prediction:\n{prediction_result}"
    )

    try:
        completion = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": "You are a clinical expert. Respond with exactly 3 sentences."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=256,
        )
        insight = completion.choices[0].message.content
        if insight:
            return insight.strip()
        return "Clinical insight generation returned empty."
    except Exception as exc:
        logger.exception("Failed to generate clinical insight via Groq.")
        return "Clinical insight generation failed due to an error."

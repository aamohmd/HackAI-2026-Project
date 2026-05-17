import os
import json
from groq import Groq
from pydantic import BaseModel

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

CLASSIFIER_SYSTEM = """You are an intent classifier for Mizan, a Moroccan legal AI assistant.
The user's transcript is in Moroccan Darija (or Arabic). Analyze and classify the legal intent.
Output a JSON object with exactly these fields:
- domain: legal domain string (e.g. "family_law", "land_law", "criminal_law", "civil_law", "labour_law")
- intent: the specific legal question or intent being asked
- confidence: float from 0.0 to 1.0 — how confident you are in the classification
- missing_context: what additional context is needed for a precise answer (empty string if none)
"""

class ClassificationResult(BaseModel):
    domain: str
    intent: str
    confidence: float
    missing_context: str

def classify_intent(transcript: str) -> ClassificationResult:
    """
    Ultra-fast intent classification via Groq Llama 3.1 8B (~200ms).
    Replaces the previous Gemini 2.0 Flash call (~1.2s).
    """
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": CLASSIFIER_SYSTEM},
            {"role": "user",   "content": f"Transcript: {transcript}"},
        ],
        response_format={"type": "json_object"},
        temperature=0,
    )

    data = json.loads(response.choices[0].message.content)
    return ClassificationResult(**data)

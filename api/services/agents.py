from pydantic import BaseModel
from typing import Optional
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Use Groq - The fastest LLM provider for your hackathon
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class LandDisputeState(BaseModel):
    claimant_name: Optional[str] = None
    opponent_name: Optional[str] = None
    location: Optional[str] = None
    date_of_incident: Optional[str] = None
    proof_type: Optional[str] = None # e.g., Moulkiya, Witnesses
    description: Optional[str] = None
    is_complete: bool = False

SYSTEM_PROMPT_EXTRACTOR = """
You are a legal paralegal assistant specialized in Moroccan land disputes. 
Your task is to extract facts from a user's testimony transcript.
Update the current state JSON based on the new transcript.
Do not hallucinate facts. If information is missing, leave it as null.
Transcript language: Moroccan Darija (transcribed).
Output MUST be a valid JSON matching the schema.
"""

SYSTEM_PROMPT_INTERVIEWER = """
You are Sidi El Qadi, a supportive legal counselor in rural Morocco. 
The user is a farmer or villager who might be illiterate. 
Speak in friendly, clear Moroccan Darija (written phonetically).
Your goal is to listen to their story and help them build a legal brief.
Based on the current extracted facts, identify what is missing and ask ONE follow-up question.
Missing facts prioritize: Location, Opponent Name, Proof Type.
If all major facts are present, thank the user and say their dossier is sealed and ready for the judge.
"""

def extract_facts(transcript: str, current_state: LandDisputeState) -> LandDisputeState:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # High reasoning for extraction
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_EXTRACTOR},
                {"role": "user", "content": f"Current State: {current_state.model_dump_json()}\nNew Transcript: {transcript}"}
            ],
            response_format={"type": "json_object"}
        )
        updated_data = response.choices[0].message.content
        return LandDisputeState.model_validate_json(updated_data)
    except Exception as e:
        print(f"Error extracting facts: {e}")
        return current_state

def get_next_question(state: LandDisputeState) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant", # Ultra-fast for chat responses
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_INTERVIEWER},
                {"role": "user", "content": f"Current State: {state.model_dump_json()}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting next question: {e}")
        return "Mumkin t-zid t-sharrah liya ktar? (Can you explain more to me?)"

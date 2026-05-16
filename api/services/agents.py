from pydantic import BaseModel
from typing import Optional
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Use Groq - The fastest LLM provider for your hackathon
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class Citation(BaseModel):
    article_number: str
    law_name: str
    law_code: str
    claim_supported: str

class MizanResult(BaseModel):
    answer_darija: str

    citations: list[Citation]
    confidence: float
    recommend_lawyer: bool
    answer_register: str # 'simple', 'standard', 'technical'

class LandDisputeState(BaseModel):
    claimant_name: Optional[str] = None
    opponent_name: Optional[str] = None
    location: Optional[str] = None
    date_of_incident: Optional[str] = None
    proof_type: Optional[str] = None # e.g., Moulkiya, Witnesses
    description: Optional[str] = None
    is_complete: bool = False
    interim_citations: Optional[list[Citation]] = None
    mizan_result: Optional[MizanResult] = None


SYSTEM_PROMPT_EXTRACTOR = """
You are a legal paralegal assistant specialized in Moroccan land disputes. 
Your task is to extract facts from a user's testimony transcript.
Update the current state JSON based on the new transcript.
Do not hallucinate facts. If information is missing, leave it as null.
Transcript language: Moroccan Darija (transcribed).
Output MUST be a valid JSON matching the schema.
"""

SYSTEM_PROMPT_INTERVIEWER = """
You are Mizan, a supportive legal counselor in rural Morocco. 
The user is a farmer or villager who might be illiterate. 
Speak in friendly, clear Moroccan Darija (written phonetically).
Your goal is to listen to their story and help them build a legal brief.
Based on the current extracted facts, identify what is missing and ask ONE follow-up question.
Missing facts prioritize: Location, Opponent Name, Proof Type.
If all major facts are present, thank the user and say their dossier is sealed and ready for the judge.
"""

MOROCCAN_LAND_LAWS = [
    {"article_number": "Article 1", "law_name": "Dahir on Land Registration", "law_code": "1-11-177", "content": "Registration of land provides absolute proof of ownership and is opposable to third parties."},
    {"article_number": "Article 62", "law_name": "Dahir on Land Registration", "law_code": "1-11-177", "content": "Any real right relating to a registered building exists only by its registration in the land registry."},
    {"article_number": "Article 42", "law_name": "Code of Real Rights", "law_code": "39-08", "content": "Ownership of land includes the space above and the ground below."},
    {"article_number": "Article 3", "law_name": "Code of Real Rights", "law_code": "39-08", "content": "Possession (L-hiaza) must be peaceful, public, and continuous for 10 years to create a presumption of ownership between individuals."}
]

def search_relevant_laws(description: str) -> list[Citation]:
    # Simulated RAG: Use LLM to find which mock laws apply
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Identify which Moroccan law articles from this list apply to the case. Output JSON list of citations."},
                {"role": "user", "content": f"Laws: {MOROCCAN_LAND_LAWS}\nCase: {description}"}
            ],
            response_format={"type": "json_object"}
        )
        # Parse and return Citations
        import json
        data = json.loads(response.choices[0].message.content)
        # Handle different potential JSON structures from LLM
        citations_data = data.get("citations", data.get("articles", []))
        return [Citation(**c) for c in citations_data if isinstance(c, dict)]
    except Exception as e:
        print(f"RAG Error: {e}")
        return []

def generate_final_brief(state: LandDisputeState) -> MizanResult:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are Mizan. Generate a final legal brief in Moroccan Darija. Include summary, citations, and recommendation."},
                {"role": "user", "content": f"Final State: {state.model_dump_json()}"}
            ],
            response_format={"type": "json_object"}
        )
        import json
        data = json.loads(response.choices[0].message.content)
        return MizanResult(**data)
    except Exception as e:
        print(f"Synthesis Error: {e}")
        return MizanResult(
            answer_darija="Smahli, ma-kdert-sh n-kemmel l-brief dialek daba.",
            citations=[],
            confidence=0.5,
            recommend_lawyer=True,
            answer_register="simple"
        )

def extract_facts(transcript: str, current_state: LandDisputeState) -> LandDisputeState:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_EXTRACTOR},
                {"role": "user", "content": f"Current State: {current_state.model_dump_json()}\nNew Transcript: {transcript}"}
            ],
            response_format={"type": "json_object"}
        )
        updated_data = response.choices[0].message.content
        new_state = LandDisputeState.model_validate_json(updated_data)
        
        # Add interim citations if description is available
        if new_state.description:
            new_state.interim_citations = search_relevant_laws(new_state.description)
            
        # Check if complete and generate result
        if new_state.is_complete and not new_state.mizan_result:
            new_state.mizan_result = generate_final_brief(new_state)
            
        return new_state
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

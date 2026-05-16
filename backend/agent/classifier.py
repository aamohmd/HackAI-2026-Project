import os
import google.generativeai as genai
from pydantic import BaseModel

# Initialize Gemini if key exists, otherwise placeholder (e.g. tests)
if "GEMINI_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    
model = genai.GenerativeModel("gemini-2.0-flash")

CLASSIFIER_TOOL = {
    "name": "submit_intent",
    "description": "Submit classified intent based on transcript",
    "parameters": {
        "type": "object",
        "properties": {
            "domain": {"type": "string", "description": "Legal domain (e.g. family_law, land, labour, civil_debt)"},
            "intent": {"type": "string", "description": "The specific intent or question being asked"},
            "confidence": {"type": "number", "description": "Confidence score from 0.0 to 1.0"},
            "missing_context": {"type": "string", "description": "What context is missing to give a good answer, if any"}
        },
        "required": ["domain", "intent", "confidence", "missing_context"]
    }
}

class ClassificationResult(BaseModel):
    domain: str
    intent: str
    confidence: float
    missing_context: str

def classify_intent(transcript: str) -> ClassificationResult:
    prompt = f"""
    You are an intent classifier for Mizan, a Moroccan legal AI.
    Analyze the user's transcript and classify the intent.
    Transcript: {transcript}
    """
    
    response = model.generate_content(
        contents=[{"role": "user", "parts": [prompt]}],
        tools=[{"function_declarations": [CLASSIFIER_TOOL]}],
        tool_config={"function_calling_config": {"mode": "ANY"}}
    )
    
    # Extract the function call arguments
    call = response.candidates[0].content.parts[0].function_call
    # Convert protobuf struct to dict
    args_dict = dict(call.args.items())
    
    return ClassificationResult(**args_dict)

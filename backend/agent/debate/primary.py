import os
import google.generativeai as genai
from backend.schemas import PrimaryAnswer, Chunk
from backend.prompts import SYSTEM_PRIMARY, build_primary_prompt
from backend.tools import ANSWER_TOOL

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "dummy_key_for_tests"))

def call_primary_agent(transcript: str, chunks: list[Chunk], literacy_score: float) -> PrimaryAnswer:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PRIMARY
    )
    prompt = build_primary_prompt(transcript, chunks, literacy_score)
    response = model.generate_content(
        contents=[{"role": "user", "parts": [prompt]}],
        tools=[{"function_declarations": [ANSWER_TOOL]}],
        tool_config={"function_calling_config": {"mode": "ANY"}}
    )
    
    # Extract function call args
    call = response.candidates[0].content.parts[0].function_call
    return PrimaryAnswer(**dict(call.args))

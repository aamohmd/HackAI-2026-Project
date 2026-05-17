import os
import google.generativeai as genai
from backend.schemas import ClaimScores, Chunk
from backend.prompts import SYSTEM_DEVIL, build_devil_prompt
from backend.tools import SCORE_CLAIMS_TOOL

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "dummy_key_for_tests"))

def call_devils_advocate(answer: str, chunks: list[Chunk]) -> ClaimScores:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_DEVIL
    )
    prompt = build_devil_prompt(answer, chunks)
    response = model.generate_content(
        contents=[{"role": "user", "parts": [prompt]}],
        tools=[{"function_declarations": [SCORE_CLAIMS_TOOL]}],
        tool_config={"function_calling_config": {"mode": "ANY"}}
    )
    
    call = response.candidates[0].content.parts[0].function_call
    return ClaimScores(**dict(call.args))

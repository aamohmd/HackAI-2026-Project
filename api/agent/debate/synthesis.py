import os
import google.generativeai as genai
from api.schemas import FinalAnswer, PrimaryAnswer, ClaimScores
from api.prompts import SYSTEM_SYNTHESIS, build_synthesis_prompt
from api.tools import SYNTHESIS_TOOL

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "dummy_key_for_tests"))

def call_synthesis_agent(primary: PrimaryAnswer, scores: ClaimScores) -> FinalAnswer:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_SYNTHESIS
    )
    
    primary_dict = primary.model_dump()
    scores_dict = scores.model_dump()
    prompt = build_synthesis_prompt(primary_dict, scores_dict)
    
    response = model.generate_content(
        contents=[{"role": "user", "parts": [prompt]}],
        tools=[{"function_declarations": [SYNTHESIS_TOOL]}],
        tool_config={"function_calling_config": {"mode": "ANY"}}
    )
    
    call = response.candidates[0].content.parts[0].function_call
    return FinalAnswer(**dict(call.args))

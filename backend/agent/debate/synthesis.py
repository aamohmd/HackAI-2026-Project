import os
import json
from openai import OpenAI
from backend.schemas import FinalAnswer, PrimaryAnswer, ClaimScores
from backend.prompts import SYSTEM_SYNTHESIS, build_synthesis_prompt
from backend.tools import SYNTHESIS_TOOL

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

def call_synthesis_agent(primary: PrimaryAnswer, scores: ClaimScores) -> FinalAnswer:
    primary_dict = primary.model_dump()
    scores_dict  = scores.model_dump()
    prompt = build_synthesis_prompt(primary_dict, scores_dict)

    response = openai_client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": SYSTEM_SYNTHESIS},
            {"role": "user",   "content": prompt},
        ],
        tools=[{"type": "function", "function": SYNTHESIS_TOOL}],
        tool_choice={"type": "function", "function": {"name": "submit_synthesis"}},
    )

    tc = response.choices[0].message.tool_calls[0]
    args = json.loads(tc.function.arguments)
    return FinalAnswer(**args)

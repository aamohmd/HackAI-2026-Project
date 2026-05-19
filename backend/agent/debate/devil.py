import os
import json
from openai import OpenAI
from backend.schemas import ClaimScores, Chunk
from backend.prompts import SYSTEM_DEVIL, build_devil_prompt
from backend.tools import SCORE_CLAIMS_TOOL

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

def call_devils_advocate(answer: str, chunks: list[Chunk]) -> ClaimScores:
    prompt = build_devil_prompt(answer, chunks)
    response = openai_client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": SYSTEM_DEVIL},
            {"role": "user",   "content": prompt},
        ],
        tools=[{"type": "function", "function": SCORE_CLAIMS_TOOL}],
        tool_choice={"type": "function", "function": {"name": "score_claims"}},
    )

    tc = response.choices[0].message.tool_calls[0]
    args = json.loads(tc.function.arguments)
    return ClaimScores(**args)

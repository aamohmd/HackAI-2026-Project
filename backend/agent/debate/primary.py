import os
import json
from openai import OpenAI
from backend.schemas import PrimaryAnswer, Chunk
from backend.prompts import SYSTEM_PRIMARY, build_primary_prompt
from backend.tools import ANSWER_TOOL

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

def call_primary_agent(transcript: str, chunks: list[Chunk]) -> PrimaryAnswer:
    prompt = build_primary_prompt(transcript, chunks)
    response = openai_client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PRIMARY},
            {"role": "user",   "content": prompt},
        ],
        tools=[{"type": "function", "function": ANSWER_TOOL}],
        tool_choice={"type": "function", "function": {"name": "submit_legal_answer"}},
    )

    tc = response.choices[0].message.tool_calls[0]
    args = json.loads(tc.function.arguments)
    return PrimaryAnswer(**args)

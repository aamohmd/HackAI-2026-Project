import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_clarifying_question(transcript: str, missing_context: str) -> str:
    """
    Generates a polite follow-up question in Moroccan Darija.
    Uses Groq Llama 3.1 8B (~200ms) instead of Gemini (~1s).
    """
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": (
                "أنت \"ميزان\"، مساعد قانوني مغربي.\n"
                "The user asked a legal question but we are missing context.\n"
                "Write a short, polite follow-up question in Moroccan Darija "
                "asking for the missing context.\n"
                "Output ONLY the question, nothing else."
            )},
            {"role": "user", "content": (
                f"Transcript: {transcript}\n"
                f"Missing context: {missing_context}"
            )},
        ],
        temperature=0.3,
        max_tokens=150,
    )
    return response.choices[0].message.content.strip()

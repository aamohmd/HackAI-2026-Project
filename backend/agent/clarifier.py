import os
import google.generativeai as genai

if "GEMINI_API_KEY" in os.environ:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    
model = genai.GenerativeModel("gemini-2.0-flash")

def generate_clarifying_question(transcript: str, missing_context: str) -> str:
    prompt = f"""
    أنت "ميزان"، مساعد قانوني مغربي.
    The user asked a legal question but we are missing context to give a precise answer.
    
    Transcript: {transcript}
    Missing context: {missing_context}
    
    Write a short, polite follow-up question in Moroccan Darija asking for this missing context.
    Only output the question, nothing else.
    """
    response = model.generate_content(prompt)
    return response.text.strip()

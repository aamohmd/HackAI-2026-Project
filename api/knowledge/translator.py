import os
import google.generativeai as genai
from typing import Optional

def translate_to_arabic(text: str) -> str:
    """
    Translates French/English legal text to Modern Standard Arabic using Gemini.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback for dev/demo if key is missing
        return f"[TRANSLATED TO ARABIC]: {text}"
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    prompt = f"""
    You are a legal translator specialized in Moroccan law. 
    Translate the following French or English legal text into Modern Standard Arabic (MSA).
    Maintain the formal legal tone and preserve all article numbers and names.
    Only return the translated text.
    
    TEXT:
    {text}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Translation error: {e}")
        return text # Return original text as fallback

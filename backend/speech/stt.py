from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def normalize_darija(text: str) -> str:
    """
    Lightweight Darija normalization.
    Fixes the most common Whisper MSA→Darija errors.
    """
    replacements = {
        "ماذا": "شنو",
        "كيف حالك": "كيداير",
        "لماذا": "علاش",
        "أريد": "بغيت",
        "لا أعرف": "ما عارفش",
        "أين": "فين",
        "هل يمكنني": "واش يمكن ليا",
        "المحكمة": "المحكمة",  # keep legal terms as-is
    }
    for msa, darija in replacements.items():
        text = text.replace(msa, darija)
    return text

def transcribe(audio_path: str) -> str:
    """
    Transcribes audio to text using Groq's Whisper-large-v3,
    then applies post-processing to normalize MSA back to real Darija.
    """
    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=(os.path.basename(audio_path), audio_file.read()),
            model="whisper-large-v3",
            language="ar",
            response_format="text"
        )
    return normalize_darija(transcription)

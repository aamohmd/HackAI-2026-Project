import os
import mlx_whisper

WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "mlx-community/whisper-medium-mlx")

def transcribe(audio_path: str) -> str:
    """
    Transcribes audio to text using mlx-whisper (optimized for Apple Silicon).
    """
    result = mlx_whisper.transcribe(
        audio_path,
        path_or_hf_repo=WHISPER_MODEL,
        language="ar"
    )
    return result["text"]

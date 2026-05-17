import edge_tts
import asyncio
import os
from elevenlabs.client import ElevenLabs
from typing import AsyncGenerator

# Configuration from environment
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "edge-tts")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "A9ATTqUUQ6GHu0coCz8t")
ELEVENLABS_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")

# Initialize ElevenLabs client if key is available
el_client = None
if ELEVENLABS_API_KEY:
    el_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

async def speak(text: str, output_path: str):
    """
    Generates speech from text and saves to file.
    """
    if TTS_PROVIDER == "elevenlabs" and el_client:
        audio = el_client.text_to_speech.convert(
            text=text,
            voice_id=ELEVENLABS_VOICE_ID,
            model_id=ELEVENLABS_MODEL_ID,
            language_code="ar"
        )
        with open(output_path, "wb") as f:
            for chunk in audio:
                f.write(chunk)
    else:
        # Fallback to edge-tts
        communicate = edge_tts.Communicate(text, voice="ar-MA-JamalNeural")
        await communicate.save(output_path)

async def stream_speak(text: str) -> AsyncGenerator[bytes, None]:
    """
    Streams speech from text.
    Yields audio binary chunks.
    """
    if TTS_PROVIDER == "elevenlabs" and el_client:
        # ElevenLabs SDK returns a generator of bytes
        audio_stream = el_client.text_to_speech.convert(
            text=text,
            voice_id=ELEVENLABS_VOICE_ID,
            model_id=ELEVENLABS_MODEL_ID,
            language_code="ar"
        )
        # Convert sync generator to async generator
        for chunk in audio_stream:
            yield chunk
            await asyncio.sleep(0) # Yield control
    else:
        # Fallback to edge-tts
        communicate = edge_tts.Communicate(text, voice="ar-MA-JamalNeural")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

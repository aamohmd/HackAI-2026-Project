import edge_tts
import asyncio

async def speak(text: str, output_path: str):
    """
    Generates speech from text and saves to file using edge-tts.
    """
    communicate = edge_tts.Communicate(text, voice="ar-MA-JamalNeural")
    await communicate.save(output_path)

async def stream_speak(text: str):
    """
    Streams speech from text using edge-tts.
    Yields audio binary chunks.
    """
    communicate = edge_tts.Communicate(text, voice="ar-MA-JamalNeural")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]

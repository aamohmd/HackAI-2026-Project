import asyncio
import base64
from typing import AsyncGenerator
from backend.schemas import FinalAnswer, UserProfile, Citation
from backend.speech.stt import transcribe
from backend.agent.classifier import classify_intent
from backend.agent.clarifier import generate_clarifying_question
from backend.agent.formatter import format_answer
from backend.speech.tts import stream_speak

class AgentLoop:
    def __init__(self, audio_path: str, profile: UserProfile):
        self.audio_path = audio_path
        self.profile = profile

    async def run(self) -> AsyncGenerator[dict, None]:
        loop = asyncio.get_event_loop()

        # Step 1: STT — wrapped in executor (sync Groq call)
        yield {"type": "status", "data": "transcribing"}
        try:
            transcript = await loop.run_in_executor(
                None, transcribe, self.audio_path
            )
            yield {"type": "transcript", "data": transcript}
        except Exception as e:
            yield {"type": "error", "data": f"STT Error: {e}"}
            return

        # Step 2: Classifier — wrapped in executor (sync call)
        yield {"type": "status", "data": "classifying_intent"}
        try:
            classification = await loop.run_in_executor(
                None, classify_intent, transcript
            )
        except Exception as e:
            yield {"type": "error", "data": f"Classification Error: {e}"}
            return

        # Step 3: Clarifier check
        if classification.confidence < 0.7:
            yield {"type": "status", "data": "clarifying"}
            question = await loop.run_in_executor(
                None, generate_clarifying_question, transcript, classification.missing_context
            )
            yield {"type": "clarifying_question", "data": question}
            async for chunk in stream_speak(question):
                b64_audio = base64.b64encode(chunk).decode('utf-8')
                yield {"type": "audio_chunk", "data": b64_audio}
            return

        # Step 4: Retrieve — singleton retriever (no per-request model reload)
        yield {"type": "status", "data": "retrieving"}
        try:
            from backend.services.agents import _get_retriever, _detect_domain
            retriever = _get_retriever()
            if retriever is None:
                yield {"type": "error", "data": "Retriever unavailable — knowledge base not loaded"}
                return
            domain = _detect_domain(transcript)
            chunks = await loop.run_in_executor(
                None, lambda: retriever.retrieve(transcript, domain=domain, top_n=6)
            )
            yield {"type": "status", "data": f"retrieved_{len(chunks)}_chunks"}
        except Exception as e:
            yield {"type": "error", "data": f"Retrieval Error: {e}"}
            return

        # Step 5: Debate Loop — Primary Agent → Devil's Advocate → Synthesis Agent
        yield {"type": "status", "data": "debating"}
        try:
            from backend.agent.debate.loop import DebateLoop
            debate = DebateLoop(max_retries=2)
            final_answer = await loop.run_in_executor(
                None, lambda: debate.run(transcript, chunks, self.profile)
            )
        except Exception as e:
            yield {"type": "error", "data": f"Debate Error: {e}"}
            return

        # Step 6: Formatter
        yield {"type": "status", "data": "formatting"}
        formatted_answer = format_answer(final_answer, self.profile)
        yield {"type": "final_answer", "data": formatted_answer.model_dump()}

        # Step 7: TTS Stream
        yield {"type": "status", "data": "speaking"}
        try:
            async for audio_chunk in stream_speak(formatted_answer.answer_darija):
                b64_audio = base64.b64encode(audio_chunk).decode('utf-8')
                yield {"type": "audio_chunk", "data": b64_audio}
        except Exception as e:
            yield {"type": "error", "data": f"TTS Error: {e}"}

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
        # Step 1: STT
        yield {"type": "status", "data": "transcribing"}
        try:
            # In a real environment we would save the audio stream to disk first
            # For this mock, we assume audio_path is already written
            transcript = transcribe(self.audio_path)
            yield {"type": "transcript", "data": transcript}
        except Exception as e:
            yield {"type": "error", "data": f"STT Error: {e}"}
            return

        # Step 2: Classifier
        yield {"type": "status", "data": "classifying_intent"}
        try:
            classification = classify_intent(transcript)
        except Exception as e:
            yield {"type": "error", "data": f"Classification Error: {e}"}
            return
            
        # Step 3: Clarifier check
        if classification.confidence < 0.7:
            yield {"type": "status", "data": "clarifying"}
            question = generate_clarifying_question(transcript, classification.missing_context)
            yield {"type": "clarifying_question", "data": question}
            # Stream the clarifying question TTS
            async for chunk in stream_speak(question):
                b64_audio = base64.b64encode(chunk).decode('utf-8')
                yield {"type": "audio_chunk", "data": b64_audio}
            return

        # Step 4 & 5: Retrieve and Debate (Mocked - waiting for AI Dev 1 & 2)
        yield {"type": "status", "data": "retrieving_and_debating"}
        final_answer = FinalAnswer(
            answer_darija="القانون كيقول...",
            citations=[
                Citation(article_number="12", law_name="مدونة الأسرة", claim_supported="الجواب")
            ],
            confidence=0.85,
            recommend_lawyer=False
        )
        
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

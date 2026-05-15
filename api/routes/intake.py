from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
from openai import OpenAI
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..services.agents import extract_facts, get_next_question, LandDisputeState
from ..utils import UPLOAD_DIR, ensure_upload_dir

router = APIRouter(prefix="/intake", tags=["intake"])
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/voice")
async def process_voice(
    file: UploadFile = File(...),
    state_json: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Parse current state
        current_state = LandDisputeState.model_validate_json(state_json)
        
        # 2. Save incoming audio temporarily
        ensure_upload_dir()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "wav"
        temp_filename = f"intake_{uuid.uuid4()}.{file_ext}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # 3. Transcribe (Whisper)
        with open(temp_path, "rb") as audio_file:
            transcript_res = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ar" # Whisper handles Arabic/Darija well
            )
        transcript = transcript_res.text
        
        # 4. Agentic Chain: Extract Facts
        updated_state = extract_facts(transcript, current_state)
        
        # 5. Agentic Chain: Get Next Question
        next_question = get_next_question(updated_state)
        
        # 6. Generate TTS for the question
        tts_filename = f"reply_{uuid.uuid4()}.mp3"
        tts_path = os.path.join(UPLOAD_DIR, tts_filename)
        
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=next_question
        )
        response.stream_to_file(tts_path)
        
        # Cleanup temp upload (optional, but good for hackathon disk space)
        # os.remove(temp_path)
        
        return {
            "updated_state": updated_state,
            "transcript": transcript,
            "next_question": next_question,
            "audio_url": f"/uploads/{tts_filename}"
        }
        
    except Exception as e:
        print(f"Intake Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

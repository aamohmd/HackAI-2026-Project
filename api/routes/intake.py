from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
from groq import Groq
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..services.agents import extract_facts, get_next_question, LandDisputeState
from ..utils import UPLOAD_DIR, ensure_upload_dir

router = APIRouter(prefix="/intake", tags=["intake"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
            
        # 3. Transcribe using Groq's Whisper (blazing fast)
        with open(temp_path, "rb") as audio_file:
            transcript_res = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=(temp_filename, audio_file.read()), # Groq expects (name, content)
                language="ar" 
            )
        transcript = transcript_res.text
        
        # 4. Agentic Chain: Extract Facts
        updated_state = extract_facts(transcript, current_state)
        
        # 5. Agentic Chain: Get Next Question
        next_question = get_next_question(updated_state)
        
        # Note: We skip server-side TTS to save cost/latency. 
        # The frontend will use browser-native speechSynthesis.
        
        return {
            "updated_state": updated_state,
            "transcript": transcript,
            "next_question": next_question
        }
        
    except Exception as e:
        print(f"Intake Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

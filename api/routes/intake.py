from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Optional

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

from ..schemas import IntakeTextRequest

from ..models import User, Dossier

@router.post("/voice")
async def process_voice(
    file: UploadFile = File(...),
    state_json: str = Form(...),
    dossier_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        current_state = LandDisputeState.model_validate_json(state_json)
        ensure_upload_dir()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "wav"
        temp_filename = f"intake_{uuid.uuid4()}.{file_ext}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)
        
        content = await file.read()
        with open(temp_path, "wb") as buffer:
            buffer.write(content)
            
        with open(temp_path, "rb") as audio_file:
            transcript_res = client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=(temp_filename, audio_file.read()),
                language="ar" 
            )
        transcript = transcript_res.text
        
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return await _process_common(db, current_user.id, transcript, current_state, dossier_id)
        
    except Exception as e:
        print(f"Intake Voice Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text")
async def process_text(
    request: IntakeTextRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        current_state = LandDisputeState.model_validate_json(request.state_json)
        return await _process_common(db, current_user.id, request.text, current_state, request.dossier_id)
    except Exception as e:
        print(f"Intake Text Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _process_common(db: Session, user_id: str, text: str, current_state: LandDisputeState, dossier_id: Optional[str]):
    # 1. Agentic Chain: Extract Facts
    updated_state = extract_facts(text, current_state)
    
    # 2. Agentic Chain: Get Next Question
    next_question = get_next_question(updated_state)
    
    # 3. Persistence
    if dossier_id:
        dossier = db.query(Dossier).filter(Dossier.id == dossier_id, Dossier.user_id == user_id).first()
        if dossier:
            dossier.state = updated_state.model_dump()
            dossier.status = "sealed" if updated_state.is_complete else "draft"
    else:
        dossier = Dossier(
            user_id=user_id,
            state=updated_state.model_dump(),
            status="sealed" if updated_state.is_complete else "draft"
        )
        db.add(dossier)
    
    db.commit()
    db.refresh(dossier)
    
    return {
        "updated_state": updated_state,
        "transcript": text,
        "next_question": next_question,
        "dossier_id": dossier.id
    }



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User, Dossier
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/dossiers", tags=["dossiers"])

class DossierRead(BaseModel):
    id: str
    state: dict
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[DossierRead])
def list_dossiers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Dossier).filter(Dossier.user_id == current_user.id).order_by(Dossier.updated_at.desc()).all()

@router.get("/{dossier_id}", response_model=DossierRead)
def get_dossier(
    dossier_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id, Dossier.user_id == current_user.id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")
    return dossier

@router.delete("/{dossier_id}")
def delete_dossier(
    dossier_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id, Dossier.user_id == current_user.id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")
    
    db.delete(dossier)
    db.commit()
    return {"message": "Dossier deleted"}

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal, Any

class UserBase(BaseModel):
    phone_number: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserPreferenceRead(BaseModel):
    theme: str
    language: str
    timezone: str
    marketing_emails: bool
    security_emails: bool
    update_emails: bool

    class Config:
        from_attributes = True

class UserPreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    marketing_emails: Optional[bool] = None
    security_emails: Optional[bool] = None
    update_emails: Optional[bool] = None

class UserDelete(BaseModel):
    password: str
    confirmation_phrase: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone_number: Optional[str] = None

class IntakeTextRequest(BaseModel):
    text: str
    state_json: str
    dossier_id: Optional[str] = None

class Chunk(BaseModel):
    text: str
    article_number: str
    law_name: str
    law_code: str
    domain: str
    topic_tags: List[str] = []
    language: str = "ar"
    publication_date: Optional[str] = None
    source_url: Optional[str] = None

class UserProfile(BaseModel):
    user_id: str
    wilaya: str
    topics_asked: List[str] = []
    low_conf_count: int = 0
    feedback_log: List[Dict] = []

    def update_from_feedback(self, thumbs_up: bool, answer_confidence: float):
        self.feedback_log.append({"up": thumbs_up, "conf": answer_confidence})
        if not thumbs_up and answer_confidence < 0.6:
            self.low_conf_count += 1

class Citation(BaseModel):
    article_number: str
    law_name: str
    law_code: Optional[str] = None
    claim_supported: str = Field(description="The specific claim in the answer this article supports")

class PrimaryAnswer(BaseModel):
    answer_darija: str = Field(description="The full answer in Moroccan Darija")
    answer_verbal: Optional[str] = Field(None, description="The conversational verbal Darija script designed for speech output")
    audio_url: Optional[str] = Field(None, description="The URL to the pre-rendered audio file")
    citations: List[Citation]
    confidence: float
    recommend_lawyer: bool
    answer_register: Literal["simple", "standard", "technical"] = "standard"

class ClaimScoreItem(BaseModel):
    claim: str
    score: Literal["grounded", "hedged", "not_in_context"]

class ClaimScores(BaseModel):
    scores: List[ClaimScoreItem]

class WebSocketMessage(BaseModel):
    type: Literal["status", "transcript", "audio_chunk", "final_answer", "error"]
    data: Any

class FinalAnswer(BaseModel):
    answer_darija: str
    answer_verbal: Optional[str] = None
    audio_url: Optional[str] = None
    citations: List[Citation]
    confidence: float
    recommend_lawyer: bool

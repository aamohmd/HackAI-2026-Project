import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Chunk(BaseModel):
    text: str
    article_number: str
    law_name: str
    law_code: str
    domain: str
    topic_tags: List[str]
    language: str
    publication_date: str
    source_url: str

class Citation(BaseModel):
    article_number: str
    law_name: str
    law_code: Optional[str] = None
    claim_supported: str

class PrimaryAnswer(BaseModel):
    answer_darija: str
    citations: List[Citation]
    confidence: float
    recommend_lawyer: bool
    answer_register: Optional[str] = None

class ClaimScoreItem(BaseModel):
    claim: str
    score: str # "grounded", "hedged", or "not_in_context"

class ClaimScores(BaseModel):
    scores: List[ClaimScoreItem]

class FinalAnswer(BaseModel):
    answer_darija: str
    citations: List[Citation]
    confidence: float
    recommend_lawyer: bool

class WebSocketMessage(BaseModel):
    type: str # "status", "transcript", "audio_chunk", "final_answer", "error"
    data: Any

class UserProfile(BaseModel):
    user_id: str
    wilaya: str
    literacy_score: float = 0.5
    topics_asked: List[str] = Field(default_factory=list)
    low_conf_count: int = 0
    feedback_log: List[Dict[str, Any]] = Field(default_factory=list)

    def update_from_feedback(self, thumbs_up: bool, answer_confidence: float):
        self.feedback_log.append({"up": thumbs_up, "conf": answer_confidence})
        if not thumbs_up and answer_confidence < 0.6:
            self.low_conf_count += 1
        self._recalculate_literacy()

    def _recalculate_literacy(self):
        recent = self.feedback_log[-10:]
        if not recent:
            return
        positive_rate = sum(1 for f in recent if f["up"]) / max(len(recent), 1)
        self.literacy_score = 0.8 * self.literacy_score + 0.2 * positive_rate

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal

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
    literacy_score: float = 0.5   # 0 = very simple Darija, 1 = technical register
    topics_asked: List[str] = []
    low_conf_count: int = 0
    feedback_log: List[Dict] = []

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

class Citation(BaseModel):
    article_number: str
    law_name: str
    law_code: Optional[str] = None
    claim_supported: str = Field(description="The specific claim in the answer this article supports")

class PrimaryAnswer(BaseModel):
    answer_darija: str = Field(description="The full answer in Moroccan Darija")
    citations: List[Citation]
    confidence: float
    recommend_lawyer: bool
    answer_register: Literal["simple", "standard", "technical"] = "standard"

class ClaimScoreItem(BaseModel):
    claim: str
    score: Literal["grounded", "hedged", "not_in_context"]

class ClaimScores(BaseModel):
    scores: List[ClaimScoreItem]

class FinalAnswer(BaseModel):
    answer_darija: str
    citations: List[Citation]
    confidence: float
    recommend_lawyer: bool

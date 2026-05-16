from dataclasses import dataclass, field
from typing import List, Optional, Dict

@dataclass
class Chunk:
    id: str
    text: str
    article_number: str
    law_name: str
    law_code: str
    domain: str
    metadata: Dict = field(default_factory=dict)

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "article_number": self.article_number,
            "law_name": self.law_name,
            "law_code": self.law_code,
            "domain": self.domain,
            "metadata": self.metadata
        }

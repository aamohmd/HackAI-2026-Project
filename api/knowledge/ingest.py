import re
import uuid
from typing import List
from api.knowledge.types import Chunk

def split_into_articles(raw_text: str, law_name: str, law_code: str, domain: str) -> List[Chunk]:
    # Pattern to match "المادة X" or "Article X"
    pattern = r'(المادة|Article)\s*(\d+)\s*[:.-]?'
    
    parts = re.split(pattern, raw_text)
    
    chunks = []
    # parts[0] is everything before the first match
    # After that, it's (prefix, number, content, prefix, number, content, ...)
    
    i = 1
    while i < len(parts):
        prefix = parts[i]
        article_number = parts[i+1]
        content = parts[i+2].strip()
        
        chunk_id = f"{law_code}_art_{article_number}_{str(uuid.uuid4())[:8]}"
        
        chunks.append(Chunk(
            id=chunk_id,
            text=f"{prefix} {article_number}: {content}",
            article_number=article_number,
            law_name=law_name,
            law_code=law_code,
            domain=domain,
            metadata={}
        ))
        i += 3
        
    return chunks

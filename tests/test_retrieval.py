import os
from backend.knowledge.retriever import HybridRetriever
from backend.knowledge.types import Chunk

def test_hybrid_retrieval_mock():
    # Setup mock retriever
    retriever = HybridRetriever(domains=["test_domain"])
    
    chunks = [
        Chunk(id="1", text="المادة 1: حضانة الأطفال تكون للأم.", article_number="1", law_name="مدونة الأسرة", law_code="moudawana", domain="test_domain", metadata={}),
        Chunk(id="2", text="المادة 2: نفقة الزوجة واجبة على الزوج.", article_number="2", law_name="مدونة الأسرة", law_code="moudawana", domain="test_domain", metadata={}),
    ]
    
    retriever.index_chunks("test_domain", chunks)
    
    # Test retrieval
    query = "شكون عنده الحق في الحضانة؟"
    results = retriever.retrieve(query, domain="test_domain")
    
    assert len(results) > 0
    # Since we use mock embeddings (all zeros), BM25 should still catch keywords if any
    # Or just return the first ones. 
    # In this case "الحضانة" is in Chunk 1.
    assert "حضانة" in results[0].text

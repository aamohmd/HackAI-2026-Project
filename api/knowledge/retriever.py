import os
import pickle
from typing import List, Optional
from rank_bm25 import BM25Okapi
from api.knowledge.vector_store import VectorStore
from api.knowledge.types import Chunk
import cohere

class HybridRetriever:
    def __init__(self, domains: List[str]):
        self.vector_store = VectorStore()
        self.domains = domains
        self.bm25_indices = {}
        self.chunks_map = {} # domain -> list of chunks
        
        self.co = None
        api_key = os.getenv("COHERE_API_KEY")
        if api_key:
            self.co = cohere.ClientV2(api_key)
            
        self._load_bm25_indices()

    def _load_bm25_indices(self):
        for domain in self.domains:
            index_path = f"api/knowledge/indices/bm25_{domain}.pkl"
            if os.path.exists(index_path):
                with open(index_path, "rb") as f:
                    data = pickle.load(f)
                    self.bm25_indices[domain] = data["index"]
                    self.chunks_map[domain] = data["chunks"]

    def index_chunks(self, domain: str, chunks: List[Chunk]):
        # Index in Vector Store
        self.vector_store.add_chunks(chunks)
        
        # Index in BM25
        tokenized_corpus = [c.text.split() for c in chunks]
        bm25 = BM25Okapi(tokenized_corpus)
        
        # Save to disk
        index_path = f"api/knowledge/indices/bm25_{domain}.pkl"
        with open(index_path, "wb") as f:
            pickle.dump({"index": bm25, "chunks": chunks}, f)
            
        self.bm25_indices[domain] = bm25
        self.chunks_map[domain] = chunks

    def retrieve(self, query: str, domain: str, top_n: int = 5) -> List[Chunk]:
        # 1. Vector Search (Top 20)
        vector_results = self.vector_store.search(query, domain=domain, top_k=20)
        
        # 2. BM25 Search (Top 20)
        bm25_results = []
        if domain in self.bm25_indices:
            tokenized_query = query.split()
            bm25_scores = self.bm25_indices[domain].get_scores(tokenized_query)
            # Get top 20 indices
            top_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:20]
            for idx in top_indices:
                if bm25_scores[idx] > 0:
                    bm25_results.append(self.chunks_map[domain][idx])
        
        # 3. Combine and Deduplicate
        seen_ids = set()
        combined_candidates = []
        
        # Add vector results
        for res in vector_results:
            if res["id"] not in seen_ids:
                # Convert back to Chunk
                meta = res["metadata"]
                # Reconstruct internal metadata if any
                internal_meta = {}
                for k, v in list(meta.items()):
                    if k.startswith("meta_"):
                        internal_meta[k[5:]] = v
                        del meta[k]
                
                combined_candidates.append(Chunk(
                    id=res["id"],
                    text=res["text"],
                    article_number=meta["article_number"],
                    law_name=meta["law_name"],
                    law_code=meta["law_code"],
                    domain=meta["domain"],
                    metadata=internal_meta
                ))
                seen_ids.add(res["id"])
                
        # Add BM25 results
        for chunk in bm25_results:
            if chunk.id not in seen_ids:
                combined_candidates.append(chunk)
                seen_ids.add(chunk.id)
                
        if not combined_candidates:
            return []
            
        # 4. Rerank (Top 5)
        if self.co and len(combined_candidates) > 1:
            documents = [c.text for c in combined_candidates]
            response = self.co.rerank(
                query=query,
                documents=documents,
                model="rerank-multilingual-v3.0",
                top_n=top_n
            )
            
            reranked_chunks = []
            for res in response.results:
                reranked_chunks.append(combined_candidates[res.index])
            return reranked_chunks
        
        return combined_candidates[:top_n]

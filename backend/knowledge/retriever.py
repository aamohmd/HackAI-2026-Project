import os
import pickle
from typing import List, Optional
from rank_bm25 import BM25Okapi
from backend.knowledge.vector_store import VectorStore
from backend.knowledge.types import Chunk

BM25_INDEX_DIR = os.path.join("backend", "knowledge", "indices")
RERANKER_MODEL = "BAAI/bge-reranker-large"

# Lazy singleton — loaded once on first retrieve() call
_reranker = None

def _get_reranker():
    global _reranker
    if _reranker is None:
        try:
            from sentence_transformers import CrossEncoder
            _reranker = CrossEncoder(RERANKER_MODEL)
            print(f"[reranker] Loaded {RERANKER_MODEL}")
        except Exception as e:
            print(f"[reranker] Failed to load — skipping rerank: {e}")
            _reranker = False  # sentinel: don't retry
    return _reranker if _reranker is not False else None

class HybridRetriever:
    def __init__(self, domains: List[str]):
        self.vector_store = VectorStore()
        self.domains = domains
        self.bm25_indices = {}
        self.chunks_map = {}  # domain -> list of chunks
        self._load_bm25_indices()

    def _load_bm25_indices(self):
        for domain in self.domains:
            index_path = os.path.join(BM25_INDEX_DIR, f"bm25_{domain}.pkl")
            if os.path.exists(index_path):
                with open(index_path, "rb") as f:
                    data = pickle.load(f)
                    self.bm25_indices[domain] = data["index"]
                    self.chunks_map[domain] = data["chunks"]
                    print(f"[retriever] Loaded BM25 index for domain '{domain}' ({len(data['chunks'])} chunks)")

    def index_chunks(self, domain: str, chunks: List[Chunk]):
        # Index in Vector Store
        self.vector_store.add_chunks(chunks)

        # Index in BM25
        tokenized_corpus = [c.text.split() for c in chunks]
        bm25 = BM25Okapi(tokenized_corpus)

        # Save to disk
        index_path = os.path.join(BM25_INDEX_DIR, f"bm25_{domain}.pkl")
        os.makedirs(BM25_INDEX_DIR, exist_ok=True)
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
        
        # 3. Reciprocal Rank Fusion (RRF) candidate merging
        vector_chunks = []
        for res in vector_results:
            meta = res["metadata"]
            internal_meta = {}
            for k, v in list(meta.items()):
                if k.startswith("meta_"):
                    internal_meta[k[5:]] = v
                    del meta[k]
            vector_chunks.append(Chunk(
                id=res["id"],
                text=res["text"],
                article_number=meta["article_number"],
                law_name=meta["law_name"],
                law_code=meta["law_code"],
                domain=meta["domain"],
                metadata=internal_meta
            ))

        bm25_chunks = []
        for chunk in bm25_results:
            if isinstance(chunk, dict):
                bm25_chunks.append(Chunk(
                    id=chunk.get("id"),
                    text=chunk.get("text"),
                    article_number=chunk.get("article_number"),
                    law_name=chunk.get("law_name"),
                    law_code=chunk.get("law_code"),
                    domain=chunk.get("domain"),
                    metadata=chunk.get("metadata", {})
                ))
            else:
                bm25_chunks.append(chunk)

        # RRF Calculation
        k = 60
        rrf_scores = {}
        for rank, chunk in enumerate(vector_chunks):
            rrf_scores[chunk.id] = rrf_scores.get(chunk.id, 0.0) + 1.0 / (k + rank + 1)
        for rank, chunk in enumerate(bm25_chunks):
            rrf_scores[chunk.id] = rrf_scores.get(chunk.id, 0.0) + 1.0 / (k + rank + 1)

        chunk_map = {c.id: c for c in vector_chunks + bm25_chunks}
        sorted_candidates = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        combined_candidates = [chunk_map[cid] for cid, _ in sorted_candidates]
        
        if not combined_candidates:
            return []

        # 4. Cross-encoder reranking (ms-marco-MiniLM-L-6-v2)
        reranker = _get_reranker()
        if reranker is not None and combined_candidates:
            try:
                pairs  = [(query, c.text) for c in combined_candidates]
                scores = reranker.predict(pairs)          # numpy array of relevance logits
                ranked = sorted(
                    zip(scores, combined_candidates),
                    key=lambda x: x[0],
                    reverse=True,
                )
                combined_candidates = [c for _, c in ranked]
                print(f"[reranker] Re-ranked {len(combined_candidates)} candidates → top {top_n}")
            except Exception as e:
                print(f"[reranker] Error during reranking (falling back to retrieval order): {e}")

        return combined_candidates[:top_n]

"""
Vector Store — ChromaDB + multilingual-e5-base
==============================================
Uses the same embedding model as the seeder so query vectors align with
stored passage vectors.  E5 requires:
  - stored docs:  "passage: " prefix  (done by seed_knowledge.py)
  - queries:      "query: "   prefix  (applied here in search())
"""
import os
from typing import List, Optional
from backend.knowledge.types import Chunk

CHROMA_PATH      = os.path.join("backend", "knowledge", "indices", "chroma")
EMBEDDING_MODEL  = "intfloat/multilingual-e5-base"
COLLECTION_NAME  = "legal_chunks"
E5_QUERY_PREFIX  = "query: "


class VectorStore:
    def __init__(self, collection_name: str = COLLECTION_NAME):
        import chromadb
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

        self.client = chromadb.PersistentClient(path=CHROMA_PATH)

        self.ef = SentenceTransformerEmbeddingFunction(
            model_name=EMBEDDING_MODEL,
            normalize_embeddings=True,
        )

        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.ef,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(self, chunks: List[Chunk]):
        """
        Add chunks to the vector store.
        Each chunk's text is stored with E5 passage prefix.
        """
        if not chunks:
            return

        ids       = [c.id for c in chunks]
        # E5: stored documents must use "passage: " prefix
        documents = [f"passage: القانون: {c.law_name} | {c.article_number}\n{c.text}" for c in chunks]
        metadatas = []
        for c in chunks:
            m = c.to_dict()
            del m["text"]
            meta = m.pop("metadata", {})
            for k, v in meta.items():
                if isinstance(v, (str, int, float, bool)):
                    m[f"meta_{k}"] = v
            metadatas.append(m)

        self.collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
        )

    def search(self, query: str, domain: Optional[str] = None, top_k: int = 20) -> List[dict]:
        """
        Search the collection.
        E5: query text must use "query: " prefix for proper alignment.
        """
        # Apply E5 query prefix
        e5_query = E5_QUERY_PREFIX + query

        where = {"domain": domain} if domain else None

        results = self.collection.query(
            query_texts=[e5_query],
            n_results=min(top_k, max(1, self.collection.count())),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        formatted = []
        if results["ids"]:
            for i in range(len(results["ids"][0])):
                meta = results["metadatas"][0][i]
                # Use display_text if stored, otherwise strip E5 prefix from document
                doc = results["documents"][0][i]
                if doc.startswith("passage: "):
                    doc = doc[len("passage: "):]

                internal_meta = {}
                clean_meta    = {}
                for k, v in meta.items():
                    if k.startswith("meta_"):
                        internal_meta[k[5:]] = v
                    else:
                        clean_meta[k] = v

                formatted.append({
                    "id":       results["ids"][0][i],
                    "text":     meta.get("display_text", doc),
                    "metadata": {**clean_meta, **internal_meta},
                    "distance": results["distances"][0][i],
                })

        return formatted

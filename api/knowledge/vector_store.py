import chromadb
import cohere
import os
from typing import List
from api.knowledge.types import Chunk

class VectorStore:
    def __init__(self, collection_name: str = "legal_chunks"):
        # ChromaDB setup
        db_path = os.path.join("api", "knowledge", "indices", "chroma")
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Cohere setup
        api_key = os.getenv("COHERE_API_KEY")
        self.co = None
        if api_key:
            self.co = cohere.ClientV2(api_key)
            
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def _embed(self, texts: List[str], input_type: str = "search_document") -> List[List[float]]:
        if not self.co:
            # Mock embeddings for testing/demo if no key
            return [[0.0] * 1024 for _ in texts]
            
        response = self.co.embed(
            texts=texts,
            model="embed-multilingual-v3.0",
            input_type=input_type,
            embedding_types=["float"]
        )
        return response.embeddings.float

    def add_chunks(self, chunks: List[Chunk]):
        if not chunks:
            return
            
        ids = [c.id for c in chunks]
        texts = [c.text for c in chunks]
        metadatas = [c.to_dict() for c in chunks]
        # remove text from metadata to avoid redundancy
        for m in metadatas:
            del m["text"]
            
        embeddings = self._embed(texts, input_type="search_document")
        
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=texts
        )

    def search(self, query: str, domain: Optional[str] = None, top_k: int = 20) -> List[dict]:
        query_embedding = self._embed([query], input_type="search_query")[0]
        
        where = None
        if domain:
            where = {"domain": domain}
            
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"]
        )
        
        # Flatten results
        formatted_results = []
        if results["ids"]:
            for i in range(len(results["ids"][0])):
                formatted_results.append({
                    "id": results["ids"][0][i],
                    "text": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i]
                })
        
        return formatted_results

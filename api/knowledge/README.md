# Mizan Knowledge Base & Retrieval (AI Dev 2)

This module implements the **Hybrid Retrieval Pipeline** for Mizan, ensuring that legal guidance is grounded in official Moroccan legislation.

## 🚀 Overview

The system uses a multi-layered approach to retrieval:
1.  **BM25 Keyword Search:** Captures exact article numbers and specific legal terminology.
2.  **Cohere Semantic Search:** Understands Moroccan Darija queries and matches them to Arabic (MSA) legal texts.
3.  **Cohere Rerank:** Refines the combined results to provide the Top-5 most relevant articles.
4.  **Offline Cache:** An SQLite database with fuzzy matching (`RapidFuzz`) that returns cached answers in "Legal Deserts" with no connectivity.

## 📂 Structure

- `types.py`: Core `Chunk` dataclass for article-level data.
- `ingest.py`: Logic to split raw legal text into individual articles using regex.
- `translator.py`: Integration with Gemini 2.0 Flash to translate French/English laws into Arabic.
- `vector_store.py`: ChromaDB integration using `embed-multilingual-v3.0`.
- `retriever.py`: The `HybridRetriever` class that orchestrates BM25, Vector Search, and Reranking.
- `cache.py`: SQLite-based offline fallback.

## 🛠 How to Use

### 1. Ingesting Data
To add a new law to the knowledge base, place the raw text in a file and run:

```bash
python scripts/ingest_legal_data.py \
    --file data/moudawana.txt \
    --law-name "مدونة الأسرة" \
    --law-code "moudawana" \
    --domain "family_law"
```

If the source is in French:
```bash
python scripts/ingest_legal_data.py \
    --file data/code_travail_fr.txt \
    --law-name "Code du Travail" \
    --law-code "labour" \
    --domain "labour_law" \
    --translate
```

### 2. Retrieving in Code
AI Dev 3 (Orchestration) can use the retriever as follows:

```python
from api.knowledge.retriever import HybridRetriever

# Initialize with known domains
retriever = HybridRetriever(domains=["family_law", "labour_law"])

# Search
query = "شحال هي مدة العدة؟"
results = retriever.retrieve(query, domain="family_law", top_n=5)

for chunk in results:
    print(f"Article {chunk.article_number} from {chunk.law_name}")
    print(chunk.text)
```

### 3. Using the Cache
```python
from api.knowledge.cache import OfflineCache

cache = OfflineCache()
# Returns a dict if a match > 85% similarity is found
cached_answer = cache.get_cached_answer("query text") 
```

## 🧪 Testing
Run the suite to verify integrity:
```bash
pytest api/tests/test_ingest.py api/tests/test_translator.py api/tests/test_retrieval.py
```

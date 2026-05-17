import os
import sys
import re
import uuid
import time
import pickle
import logging
import requests
import tempfile
from pathlib import Path
from typing import Optional

# ── Path Setup ────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mizan-seed")

# ── Config ────────────────────────────────────────────────────
CHROMA_PATH     = PROJECT_ROOT / "backend" / "knowledge" / "indices" / "chroma"
BM25_PATH       = PROJECT_ROOT / "backend" / "knowledge" / "indices"
COLLECTION_NAME = "legal_chunks"

# Best multilingual embedding for Arabic legal retrieval
# intfloat/multilingual-e5-base: 278M params, cosine similarity, BEIR SOTA
EMBEDDING_MODEL = "intfloat/multilingual-e5-base"
# Passage prefix required by E5 models for stored documents
E5_PASSAGE_PREFIX = "passage: "

# Legal themes on adala.justice.gov.ma
THEMES = {
    152: ("land_law",    "المادة العقارية",  "قانون عقاري مغربي"),
    106: ("family_law",  "المادة الأسرية",   "مدونة الأسرة المغربية"),
    7:   ("civil_law",   "المادة المدنية",   "قانون مدني مغربي"),
    149: ("criminal_law","المادة الجنائية",  "القانون الجنائي المغربي"),
}

BASE_URL             = "https://adala.justice.gov.ma"
MAX_PAGES_PER_THEME  = 6
MIN_CHUNK_CHARS      = 80    # merge articles shorter than this
MAX_CHUNK_CHARS      = 900   # split articles longer than this at paragraphs
MIN_PDF_TEXT_CHARS   = 200   # skip PDFs with less text (likely scanned images)
REQUEST_DELAY        = 1.5   # polite delay between HTTP requests


# ── Dependency Check ──────────────────────────────────────────
def check_dependencies():
    missing = []
    for pkg, import_name in [
        ("pdfplumber", "pdfplumber"),
        ("chromadb", "chromadb"),
        ("rank-bm25", "rank_bm25"),
        ("sentence-transformers", "sentence_transformers"),
    ]:
        try:
            __import__(import_name)
        except ImportError:
            missing.append(pkg)
    if missing:
        logger.error(f"Missing packages: {', '.join(missing)}")
        logger.error(f"Run: pip install {' '.join(missing)}")
        sys.exit(1)
    logger.info("All dependencies present ✓")


# ── ChromaDB Setup ────────────────────────────────────────────
def get_chroma_collection():
    """
    Create ChromaDB collection with multilingual-e5-base embedding.
    E5 is the best open-source model for Arabic retrieval without any API key.
    """
    import chromadb
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))

    logger.info(f"Loading embedding model: {EMBEDDING_MODEL} ...")
    ef = SentenceTransformerEmbeddingFunction(
        model_name=EMBEDDING_MODEL,
        normalize_embeddings=True,   # cosine similarity requires normalized vecs
    )
    logger.info("Embedding model loaded ✓")

    # Delete and recreate collection if embedding function conflicts
    # (happens when old collection used ChromaDB default embedding)
    try:
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"},
        )
    except ValueError as e:
        if "Embedding function conflict" in str(e):
            logger.warning("Existing collection uses a different embedding. Recreating with E5...")
            client.delete_collection(COLLECTION_NAME)
            collection = client.create_collection(
                name=COLLECTION_NAME,
                embedding_function=ef,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info("Collection recreated with multilingual-e5-base ✓")
        else:
            raise

    return collection


# ── Scraper ───────────────────────────────────────────────────
def scrape_theme(theme_id: int) -> list[dict]:
    """Scrape all PDF entries for a given theme across all pages."""
    all_entries = []
    for page in range(1, MAX_PAGES_PER_THEME + 1):
        url = f"{BASE_URL}/search?term=&themes={theme_id}&start_date=&end_date=&page={page}"
        logger.info(f"  Scraping page {page} → {url}")
        try:
            resp = requests.get(url, timeout=15, headers={
                "User-Agent": "Mizan-Legal-AI/1.0 (Academic/Non-Commercial)"
            })
            resp.raise_for_status()
            entries = _extract_pdf_links(resp.text)
            if not entries:
                logger.info(f"  No more results on page {page}, stopping.")
                break
            all_entries.extend(entries)
            logger.info(f"  → {len(entries)} PDFs found on page {page}")
            time.sleep(REQUEST_DELAY)
        except Exception as e:
            logger.warning(f"  Failed on page {page}: {e}")
            break
    return all_entries


def _extract_pdf_links(html: str) -> list[dict]:
    """
    Extract PDF links and titles from the raw HTML.
    The site uses relative hrefs like /api/uploads/...pdf
    Strategy:
    1. Find all unique PDF relative paths
    2. Try to get titles from inline anchor text or __NEXT_DATA__ JSON
    3. Fallback: decode the URL-encoded filename as title
    """
    import json as _json
    from urllib.parse import unquote

    entries   = []
    seen_urls = set()
    title_map: dict[str, str] = {}

    # ── Step 1: Collect all unique PDF paths ─────────────────
    pdf_path_re  = re.compile(r'"(/api/uploads/[^"#\s]+\.pdf)', re.IGNORECASE)
    all_paths    = list(dict.fromkeys(pdf_path_re.findall(html)))

    # ── Step 2: Extract titles from __NEXT_DATA__ JSON ───────
    nd_match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
    if nd_match:
        try:
            data = _json.loads(nd_match.group(1))
            def walk(obj):
                if isinstance(obj, dict):
                    file_url = (obj.get("fileUrl") or obj.get("file_url") or
                                obj.get("url") or obj.get("pdfUrl") or "")
                    title = (obj.get("title") or obj.get("name") or
                             obj.get("label") or obj.get("titleAr") or "")
                    if file_url and ".pdf" in file_url and title and len(title) > 10:
                        path_key = "/" + file_url.lstrip("/").split("?")[0].split("#")[0]
                        title_map[path_key] = title.strip()
                    for v in obj.values():
                        walk(v)
                elif isinstance(obj, list):
                    for item in obj:
                        walk(item)
            walk(data)
        except Exception:
            pass

    # ── Step 3: Titles from inline anchor text ────────────────
    inline_re = re.compile(
        r'href="(/api/uploads/[^"#]+\.pdf)[^"]*"[^>]*>\s*([^<]{15,400}?)\s*</a>',
        re.DOTALL | re.IGNORECASE,
    )
    for m in inline_re.finditer(html):
        path       = m.group(1).split("#")[0]
        title_text = re.sub(r'\s+', ' ', m.group(2)).strip()
        if title_text not in {"إقرأ الآن", "Read Now", "تصفح"} and len(title_text) >= 15:
            title_map[path] = title_text

    # ── Step 4: Build entries ─────────────────────────────────
    for path in all_paths:
        clean_path = path.split("#")[0]
        full_url   = BASE_URL + clean_path
        if full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        title = title_map.get(clean_path, "")
        if not title:
            # Decode filename from URL as fallback title
            filename = unquote(clean_path.split("/")[-1])
            filename = re.sub(r'-\d{13}\.pdf$', '', filename)
            filename = re.sub(r'\.pdf$', '', filename)
            title    = filename.strip() or f"وثيقة ({clean_path[-20:]})"

        law_num = re.search(r'رقم\s+([\d.]+)', title) or re.search(r'(\d+\.\d+)', title)
        entries.append({
            "title":      title,
            "pdf_url":    full_url,
            "law_number": law_num.group(1) if law_num else "unknown",
        })

    return entries



# ── PDF Text Extraction ───────────────────────────────────────
def download_and_extract_text(pdf_url: str) -> Optional[str]:
    """Download PDF and extract all text with pdfplumber."""
    import pdfplumber
    try:
        resp = requests.get(pdf_url, timeout=30, stream=True, headers={
            "User-Agent": "Mizan-Legal-AI/1.0"
        })
        resp.raise_for_status()
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            for chunk in resp.iter_content(8192):
                tmp.write(chunk)
            tmp_path = tmp.name
        pages = []
        with pdfplumber.open(tmp_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages.append(t)
        os.unlink(tmp_path)
        return "\n".join(pages)
    except Exception as e:
        logger.warning(f"  PDF extraction failed: {e}")
        return None


# ── Legal-Aware Chunking ──────────────────────────────────────
def legal_chunk(
    text: str,
    law_name: str,
    law_code: str,
    domain: str,
    source_url: str,
) -> list[dict]:
    """
    Best-practice legal Arabic chunking:

    1.  Split on article boundaries  (المادة / الفصل / Article + number)
    2.  Merge tiny stubs (<80 chars) into the previous chunk
    3.  Split oversized chunks (>900 chars) at paragraph (\\n\\n) boundaries
    4.  Prepend a rich context header to every chunk so the embedding captures
        the LAW NAME + ARTICLE NUMBER even in short texts.
        Format:  "قانون: {law_name} | المادة: {article_number} | {content}"
    5.  Apply E5 "passage: " prefix so embeddings are retrieval-optimized.

    Why this works for Arabic legal RAG:
    - Arabic legal text uses formal MSA (Modern Standard Arabic) with fixed
      article structures. Article-level chunking preserves legal semantics.
    - Context headers prevent the embedding model from treating short articles
      (e.g., definitions) as topically unrelated to their parent law.
    - E5 passage prefix ensures the stored vectors align with E5 query vectors
      used at retrieval time.
    """
    ARTICLE_RE = re.compile(
        r'(المادة|الفصل|Article)\s+(\d+)\s*[:.\-–—]?',
        re.UNICODE,
    )

    parts = ARTICLE_RE.split(text)
    raw_articles: list[tuple[str, str]] = []   # (article_label, content)

    # Preamble — everything before the first article
    if parts[0].strip():
        raw_articles.append(("ديباجة", parts[0].strip()))

    # Structured articles
    i = 1
    while i + 2 <= len(parts):
        prefix  = parts[i]          # "المادة"
        number  = parts[i + 1]      # "42"
        content = parts[i + 2].strip() if i + 2 < len(parts) else ""
        raw_articles.append((f"{prefix} {number}", content))
        i += 3

    # ── Post-process: merge tiny, split large ────────────────
    processed: list[tuple[str, str]] = []
    carry_label   = None
    carry_content = ""

    for label, content in raw_articles:
        # Merge short stubs into the running carry buffer
        combined = (carry_content + " " + content).strip() if carry_content else content
        if len(combined) < MIN_CHUNK_CHARS and label != "ديباجة":
            carry_label   = carry_label or label
            carry_content = combined
            continue

        # Flush carry buffer
        if carry_content:
            processed.append((carry_label, carry_content))
            carry_label   = None
            carry_content = ""

        # Split oversized chunks at paragraph boundaries
        if len(content) > MAX_CHUNK_CHARS:
            paragraphs = [p.strip() for p in re.split(r'\n{2,}', content) if p.strip()]
            buffer = ""
            for para in paragraphs:
                if len(buffer) + len(para) < MAX_CHUNK_CHARS:
                    buffer = (buffer + "\n\n" + para).strip()
                else:
                    if buffer:
                        processed.append((label, buffer))
                    buffer = para
            if buffer:
                processed.append((label, buffer))
        else:
            processed.append((label, content))

    # Flush remaining carry
    if carry_content:
        processed.append((carry_label, carry_content))

    # ── Build final chunk dicts with context-enriched text ───
    chunks = []
    for article_label, content in processed:
        if len(content.strip()) < 20:
            continue

        # Context header improves embedding quality for short articles
        context_header = f"القانون: {law_name} | {article_label}"
        full_text = f"{context_header}\n{content.strip()}"

        # E5 passage prefix: stored docs must start with "passage: "
        embedded_text = E5_PASSAGE_PREFIX + full_text

        chunk_id = f"{law_code}_{re.sub(r'\\s+', '_', article_label)}_{uuid.uuid4().hex[:8]}"

        chunks.append({
            "id":             chunk_id,
            "text":           embedded_text,          # text sent to embedding model
            "display_text":   full_text,              # text shown to LLM (no prefix)
            "article_number": article_label,
            "law_name":       law_name,
            "law_code":       law_code,
            "domain":         domain,
            "source_url":     source_url,
        })

    return chunks


# ── ChromaDB Ingest ───────────────────────────────────────────
def ingest_chunks(collection, chunks: list[dict]) -> int:
    """Upsert chunks into ChromaDB in batches of 100."""
    if not chunks:
        return 0
    ids       = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]           # E5-prefixed text → embedding
    metadatas = [{
        "article_number": c["article_number"],
        "law_name":       c["law_name"],
        "law_code":       c["law_code"],
        "domain":         c["domain"],
        "source_url":     c.get("source_url", ""),
        "display_text":   c["display_text"][:500],    # store for LLM reference
    } for c in chunks]

    total = 0
    for start in range(0, len(chunks), 100):
        end = start + 100
        try:
            collection.upsert(
                ids=ids[start:end],
                documents=documents[start:end],
                metadatas=metadatas[start:end],
            )
            total += min(100, len(chunks) - start)
        except Exception as e:
            logger.warning(f"  Batch [{start}:{end}] failed: {e}")
    return total


# ── BM25 Index ────────────────────────────────────────────────
def save_bm25_index(domain: str, new_chunks: list[dict]):
    """Merge new chunks into the domain's BM25 pickle."""
    try:
        from rank_bm25 import BM25Okapi
        BM25_PATH.mkdir(parents=True, exist_ok=True)
        index_path = BM25_PATH / f"bm25_{domain}.pkl"

        existing = []
        if index_path.exists():
            with open(index_path, "rb") as f:
                existing = pickle.load(f).get("chunks", [])

        # Use display_text (no E5 prefix) for BM25 keyword matching
        all_chunks = existing + new_chunks
        corpus     = [c.get("display_text", c["text"]).split() for c in all_chunks]
        bm25       = BM25Okapi(corpus)

        with open(index_path, "wb") as f:
            pickle.dump({"index": bm25, "chunks": all_chunks}, f)

        logger.info(f"  BM25 index saved: {domain} ({len(all_chunks)} total)")
    except Exception as e:
        logger.warning(f"  BM25 index save failed for {domain}: {e}")


# ── Main ──────────────────────────────────────────────────────
def main():
    check_dependencies()

    logger.info("=" * 62)
    logger.info("  MIZAN KNOWLEDGE SEEDER  ·  Arabic-Legal Optimized")
    logger.info(f"  Embedding : {EMBEDDING_MODEL}")
    logger.info(f"  Chunking  : Legal-article + context-enriched")
    logger.info("=" * 62)

    collection    = get_chroma_collection()
    initial_count = collection.count()
    logger.info(f"Current collection size: {initial_count} chunks\n")

    domain_new_chunks: dict[str, list] = {}
    grand_total = 0

    for theme_id, (domain, theme_label, law_type) in THEMES.items():
        logger.info(f"\n{'━'*55}")
        logger.info(f"  Theme {theme_id}  ·  {theme_label}")
        logger.info(f"{'━'*55}")

        entries = scrape_theme(theme_id)
        logger.info(f"  Total PDFs found: {len(entries)}")
        if not entries:
            continue

        domain_new_chunks.setdefault(domain, [])

        for idx, entry in enumerate(entries):
            logger.info(f"\n  [{idx+1}/{len(entries)}] {entry['title'][:65]}...")

            text = download_and_extract_text(entry["pdf_url"])
            if not text or len(text) < MIN_PDF_TEXT_CHARS:
                logger.warning(f"  ⏭  Skipped (text too short: {len(text or '')} chars)")
                time.sleep(REQUEST_DELAY)
                continue

            logger.info(f"  📄 Extracted {len(text):,} chars")

            law_code = re.sub(r"[^\w]", "_", entry["law_number"])[:20] or f"law_{theme_id}_{idx}"
            chunks   = legal_chunk(
                text       = text,
                law_name   = entry["title"],
                law_code   = law_code,
                domain     = domain,
                source_url = entry["pdf_url"],
            )
            if not chunks:
                logger.warning(f"  ⏭  No chunks produced")
                time.sleep(REQUEST_DELAY)
                continue

            logger.info(f"  ✂️  Chunked → {len(chunks)} article chunks")

            ingested = ingest_chunks(collection, chunks)
            grand_total += ingested
            domain_new_chunks[domain].extend(chunks)
            logger.info(f"  ✅ Ingested {ingested} chunks")
            time.sleep(REQUEST_DELAY)

    # Save BM25 indices
    logger.info("\n" + "=" * 62)
    logger.info("Building BM25 indices for hybrid retrieval...")
    for domain, chunks in domain_new_chunks.items():
        if chunks:
            save_bm25_index(domain, chunks)

    # Summary
    final_count = collection.count()
    logger.info("\n" + "=" * 62)
    logger.info("  SEEDING COMPLETE")
    logger.info(f"  Chunks before : {initial_count}")
    logger.info(f"  Chunks after  : {final_count}")
    logger.info(f"  New chunks    : {final_count - initial_count}")
    logger.info("=" * 62)

    if final_count > initial_count:
        logger.info("\n✅ Knowledge base populated with real Moroccan legal data!")
        logger.info("   Run the backend — the retriever is now live.\n")
    else:
        logger.warning("\n⚠️  No new chunks added. PDFs may be scanned images (OCR needed).")


if __name__ == "__main__":
    main()

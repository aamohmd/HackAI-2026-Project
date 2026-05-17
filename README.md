# ⚖️ Mizan — AI Legal Assistant for Morocco
> Voice-first, Darija-native legal guidance for underserved Moroccan communities  
> **Free-tier stack · Runs on MacBook M4 · Works on 3G and offline**

---

## What makes this different from a chatbot

Most legal AI products are RAG wrappers: user asks a question, the system retrieves chunks, an LLM writes an answer. Mizan has three architectural properties that separate it from that pattern.

**1. Structured tool-use output** — the LLM cannot produce a free-text answer. It is forced, by tool schema, to emit a typed JSON object containing the answer in Darija, an array of article citations with grounding claims, a confidence score, and a boolean flag for whether a real lawyer is recommended. No regex. No post-hoc parsing. Structured by design.

**2. Multi-agent confidence debate** — every answer passes through three sequential LLM calls: a primary agent that drafts, a devil's advocate that scores each claim as `grounded / hedged / not_in_context`, and a synthesis agent that removes unsupported claims and produces a final confidence score shown to the user as a badge.

**3. User mental model** — a lightweight profile stored per user tracks literacy level, wilaya, topics asked, and low-confidence interaction count. The answer formatter reads this profile and adjusts Darija register, sentence length, and vocabulary complexity. The system gets better at talking to each person individually over time.

---

## Free Stack — Zero Cost, Zero GPU

Every component runs on free tiers or locally on Apple Silicon. No billing required to build or demo this project.

| Layer | Technology | Cost | Why |
|-------|-----------|------|-----|
| Mobile | React Native + Expo | Free | Single codebase, Arabic RTL, fast iteration |
| Backend | FastAPI + Uvicorn | Free | Async WebSocket, lightweight |
| Orchestration | Plain Python state machine | Free | Debuggable, no framework lock-in |
| Extraction LLM | Llama 3.3 (via Groq) | Free | Fast intent extraction & structured function calling |
| Legal Reasoning LLM | GPT-5-mini (via OpenAI) | API Cost | Primary legal reasoning, counter-arguments, and synthesis |
| Embeddings | `multilingual-e5-base` | Free | Local execution via SentenceTransformers, handles Darija code-switching |
| Reranker | `ms-marco-MiniLM-L-6-v2` | Free | Local execution via CrossEncoder, highly accurate Arabic ranking |
| Vector store | ChromaDB (file-based) | Free | Zero infra, persists to disk |
| Keyword search | rank_bm25 | Free | Catches exact article number citations |
| STT | Whisper Large v3 (via Groq) | Free | Cloud offload for maximum speed and accuracy on Moroccan Arabic |
| TTS | ElevenLabs / edge-tts (`ar-MA-JamalNeural`) | API / Free | High-fidelity voice synthesis with fallback |
| Audio compression | Opus 16kbps (expo-av) | Free | ~80% smaller than WAV on upload |
| User profile | SQLite | Free | Literacy score, wilaya, feedback log |

**What runs on M4:** Local Embedding + Reranking (SentenceTransformers) + FastAPI process + ChromaDB reads. Heavy LLM reasoning and STT are offloaded to fast cloud APIs (Groq & OpenAI).

### Get your free keys

- **Groq:** https://console.groq.com/keys — for Llama 3.3 and Whisper Large v3
- **OpenAI:** For the `gpt-5-mini` reasoning pipeline.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (React Native)                      │
│                                                                   │
│  ┌──────────┐   ┌─────────────────┐   ┌──────────────────────┐   │
│  │ Mic btn  │──▶│ Opus 16 kbps    │──▶│  WebSocket / HTTPS   │   │
│  └──────────┘   └─────────────────┘   └──────────────────────┘   │
│                                                  │                │
│  ┌────────────────────────────────────────────────▼────────────┐  │
│  │            Offline cache  (SQLite + RapidFuzz)              │  │
│  │   Hit  → return cached answer with "محفوظ" badge            │  │
│  │   Miss → forward to backend                                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              User mental model  (SQLite)                    │  │
│  │   literacy_score · wilaya · topics_asked · feedback_log     │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼  WebSocket (Opus audio stream)
┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND  (FastAPI)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  STT   Whisper Large v3 (via Groq API)                   │    │
│  │        ~1s for 10s clip · maximum Arabic accuracy        │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            │ Darija transcript                    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 1 — Intent classifier  (Llama 3.3 function call)      │    │
│  │    → extracts intent, context, and checks if complete    │    │
│  │    → if missing info: generates clarifying question      │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 2 — Hybrid retriever                               │    │
│  │    Filter to domain namespace in ChromaDB                │    │
│  │    BM25 top-20 + multilingual-e5-base top-20             │    │
│  │    CrossEncoder ms-marco reranking → top 6 chunks        │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 3 — Multi-agent confidence debate  ★               │    │
│  │                                                          │    │
│  │  Call A — Primary agent  (GPT-5-mini function call #2)      │    │
│  │    Tool: submit_legal_answer                             │    │
│  │    Output: answer_darija · citations[] · confidence      │    │
│  │                     │                                    │    │
│  │                     ▼                                    │    │
│  │  Call B — Devil's advocate  (GPT-5-mini function call #3)   │    │
│  │    Tool: score_claims                                    │    │
│  │    Output: grounded | hedged | not_in_context per claim  │    │
│  │                     │                                    │    │
│  │                     ▼                                    │    │
│  │  Call C — Synthesis agent  (GPT-5-mini function call #4)    │    │
│  │    Removes not_in_context claims                         │    │
│  │    Softens hedged claims → final confidence score        │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 4 — Answer formatter                               │    │
│  │    Reads literacy_score from user mental model           │    │
│  │    Adjusts Darija register + sentence complexity         │    │
│  │    If recommend_lawyer → adds lawyer referral banner     │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  TTS   ElevenLabs / edge-tts ar-MA (streamed)            │    │
│  │        Degrades gracefully to text-only if offline       │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Feedback loop                                           │    │
│  │    Thumbs up/down → update literacy_score                │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐
  │ OpenAI/Groq │    │   ChromaDB   │    │    SQLite     │
  │ (4 calls    │    │ (namespaced, │    │ sessions,     │
  │  per query) │    │  file-based) │    │ review queue  │
  └─────────────┘    └──────────────┘    └───────────────┘
```

---

## Connectivity Tiers — Rural Reliability

Mizan degrades gracefully instead of failing silently. Connectivity is checked before every Llama 3.3 call.

```python
import time

def check_connectivity() -> str:
    """Returns 'fast', 'slow', or 'offline'."""
    try:
        start = time.time()
        requests.head("https://generativelanguage.googleapis.com", timeout=4)
        latency = time.time() - start
        return "fast" if latency < 1.5 else "slow"
    except requests.exceptions.ConnectionError:
        return "offline"
```

| Result | Pipeline behaviour |
|---|---|
| `fast` | Full pipeline — Whisper → Llama 3.3 (4 calls) → edge-tts → voice answer |
| `slow` | Whisper → Llama 3.3 → text answer (TTS skipped to save round-trip) |
| `offline` | RapidFuzz fuzzy match against SQLite cache → "محفوظ" badge |

---

## The Three AI Innovations — Deep Dive

### 1. Llama 3.3 function calling as a hard architectural constraint

The answer generator does not write free text. It is required to call a function:

```python
ANSWER_TOOL = {
    "name": "submit_legal_answer",
    "description": "Submit a grounded legal answer in Darija. You must call this function. Do not produce free text.",
    "parameters": {
        "type": "object",
        "properties": {
            "answer_darija": {
                "type": "string",
                "description": "The full answer in Moroccan Darija"
            },
            "citations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "article_number":  {"type": "string"},
                        "law_name":        {"type": "string"},
                        "law_code":        {"type": "string"},
                        "claim_supported": {
                            "type": "string",
                            "description": "The specific claim in the answer this article supports"
                        }
                    },
                    "required": ["article_number", "law_name", "claim_supported"]
                }
            },
            "confidence":       {"type": "number"},
            "recommend_lawyer": {"type": "boolean"},
            "answer_register":  {"type": "string", "enum": ["simple", "standard", "technical"]}
        },
        "required": ["answer_darija", "citations", "confidence", "recommend_lawyer"]
    }
}
```

The same pattern applies to the devil's advocate (`score_claims`) and the synthesis agent (`submit_synthesis`). Every LLM call in the pipeline is structured. The backend never parses free text.

**Hackathon demo moment 1:** Show the raw function call output in a terminal. Point to the `citations` array. Say: *"The model cannot answer without citing its sources — that constraint is in the API call, not the prompt."*

---

### 2. Multi-agent confidence debate

```python
import google.generativeai as genai

genai.configure(api_key=os.environ["GROQ_API_KEY"])
model = genai.GenerativeModel("gemini-2.0-flash")

class DebateLoop:

    def run(self, transcript: str, chunks: list[Chunk], user: UserProfile) -> FinalAnswer:
        primary = self._call_primary(transcript, chunks, user)
        scores  = self._call_devil(primary.answer_darija, chunks)
        final   = self._call_synthesis(primary, scores)
        return final

    def _call_primary(self, transcript, chunks, user) -> PrimaryAnswer:
        response = model.generate_content(
            contents=[{"role": "user", "parts": [build_primary_prompt(transcript, chunks, user.literacy_score)]}],
            tools=[{"function_declarations": [ANSWER_TOOL]}],
            tool_config={"function_calling_config": {"mode": "ANY"}}
        )
        call = response.candidates[0].content.parts[0].function_call
        return PrimaryAnswer(**dict(call.args))

    def _call_devil(self, answer: str, chunks: list[Chunk]) -> ClaimScores:
        response = model.generate_content(
            contents=[{"role": "user", "parts": [build_devil_prompt(answer, chunks)]}],
            tools=[{"function_declarations": [SCORE_CLAIMS_TOOL]}],
            tool_config={"function_calling_config": {"mode": "ANY"}}
        )
        call = response.candidates[0].content.parts[0].function_call
        return ClaimScores(**dict(call.args))

    def _call_synthesis(self, primary: PrimaryAnswer, scores: ClaimScores) -> FinalAnswer:
        response = model.generate_content(
            contents=[{"role": "user", "parts": [build_synthesis_prompt(primary, scores)]}],
            tools=[{"function_declarations": [SYNTHESIS_TOOL]}],
            tool_config={"function_calling_config": {"mode": "ANY"}}
        )
        call = response.candidates[0].content.parts[0].function_call
        return FinalAnswer(**dict(call.args))
```

The devil's advocate receives the primary answer and the raw retrieved chunks and classifies every factual claim as `grounded` (directly traceable to a chunk), `hedged` (plausible but not explicitly stated), or `not_in_context` (no support in the provided text). Claims classified `not_in_context` are deleted by the synthesis agent. Claims classified `hedged` are softened: "ممكن يكون..." rather than stated as fact.

Confidence score formula: `(grounded_count / total_claims) × 0.9`, capped at 0.6 if any claim was `not_in_context`. `recommend_lawyer` is set to `true` if confidence < 0.65 or total grounded claims < 2.

**Hackathon demo moment 2:** Show a live question where the devil's advocate flags one claim. Show it disappear from the synthesis output. Say: *"Two AI agents argue about every sentence before the user hears it."*

---

### 3. User mental model and adaptive register

```python
@dataclass
class UserProfile:
    user_id:        str
    wilaya:         str
    literacy_score: float = 0.5   # 0 = very simple Darija, 1 = technical register
    topics_asked:   list  = field(default_factory=list)
    low_conf_count: int   = 0
    feedback_log:   list  = field(default_factory=list)

    def update_from_feedback(self, thumbs_up: bool, answer_confidence: float):
        self.feedback_log.append({"up": thumbs_up, "conf": answer_confidence})
        if not thumbs_up and answer_confidence < 0.6:
            self.low_conf_count += 1
        self._recalculate_literacy()

    def _recalculate_literacy(self):
        recent = self.feedback_log[-10:]
        positive_rate = sum(1 for f in recent if f["up"]) / max(len(recent), 1)
        self.literacy_score = 0.8 * self.literacy_score + 0.2 * positive_rate
```

The answer formatter maps `literacy_score` to register:

| Score | Register | Style |
|-------|----------|-------|
| 0.0 – 0.35 | Simple | Short sentences, everyday Darija, article numbers not spoken aloud |
| 0.35 – 0.65 | Standard | Normal Darija, article numbers mentioned once, brief steps |
| 0.65 – 1.0 | Technical | Article numbers prominent, legal terms with brief in-line definitions |

**Hackathon demo moment 3:** Demo the same question with two saved profiles (rural farmer vs Casablanca paralegal). The judge sees the system producing genuinely different answers. Then show a 🟡 0.51 confidence answer with the "نصحك تمشي للمحامي" banner. Say: *"The system knows what it doesn't know. That's rare in AI products, and in a legal context it matters enormously."*

---

## Retrieval Pipeline

### Embeddings & Reranking

```python
from sentence_transformers import SentenceTransformer, CrossEncoder

# Run locally on CPU/M4
embedder = SentenceTransformer("intfloat/multilingual-e5-base")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def embed_query(text: str) -> list[float]:
    # e5 requires prefix for queries
    return embedder.encode([f"query: {text}"]).tolist()[0]

def rerank(query: str, chunks: list[Chunk], top_n: int = 5) -> list[Chunk]:
    pairs = [[query, c.text] for c in chunks]
    scores = reranker.predict(pairs)
    # Sort and return top_n
    ...
```

Both run locally via HuggingFace's transformers. No API keys needed.

### Hybrid retriever flow

```
query
  │
  ├── BM25 (rank_bm25) ──── top 20 (exact article number recall)
  │
  ├── multilingual-e5-base ─ top 20 (semantic Darija similarity)
  │
  └── deduplicate → ms-marco CrossEncoder → top 6 Chunk objects
```

Domain namespace filtering (one Chroma collection per domain) is applied before vector search, using the classifier's `domain` output.

---

## STT and TTS

### Speech-to-text — Whisper Large v3 on Groq

```python
from groq import Groq

client = Groq()

def transcribe(audio_path: str) -> str:
    with open(audio_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(audio_path, file.read()),
            model="whisper-large-v3",
            language="ar",
            response_format="json"
        )
        return transcription.text
```

Offloaded to Groq's LPU infrastructure. Sub-second latency for audio processing with maximum accuracy for Moroccan Darija accents.

### Text-to-speech — edge-tts (no key required)

```python
import edge_tts, asyncio

async def speak(text: str, output_path: str):
    communicate = edge_tts.Communicate(text, voice="ar-MA-JamalNeural")
    await communicate.save(output_path)

async def stream_speak(text: str):
    communicate = edge_tts.Communicate(text, voice="ar-MA-JamalNeural")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]
```

TTS requires connectivity. If offline, the backend sends text only and the app renders it with a "no audio" indicator.

---

## System Prompts

### Primary agent

```
أنت "ميزان"، مساعد قانوني مغربي.
دورك تساعد المواطنين المغاربة يفهمو حقوقهم القانونية.

القواعد الأساسية:
1. جاوب دايما بالدارجة المغربية.
2. ما تعطيش معلومة قانونية إلا إذا كانت موجودة في النصوص اللي عطيتيلها.
3. استعمل دايما الأداة submit_legal_answer — ما تكتبش جواب حر أبدا.
4. كل ادعاء في جوابك خاصه يكون مرتبط بفصل أو مادة من النصوص.
5. ما تتصوريش أنك محامي — أنت كتعطي معلومات، مش مشورة قانونية.
```

### Devil's advocate

```
You are a strict legal fact-checker. You receive a Darija answer and the
source chunks it was supposed to be grounded in.

For every factual claim in the answer, classify it as:
- grounded: directly and explicitly supported by one of the provided chunks
- hedged: plausible from the chunks but not directly stated
- not_in_context: not present in any of the provided chunks

Be strict. A claim is only "grounded" if it can be traced word-for-word to
a chunk. Use the score_claims function. Do not produce free text.
```

### Synthesis agent

```
You are a legal answer editor. You receive a primary Darija answer and
claim scores from a fact-checker.

Rules:
1. Remove all claims classified as not_in_context entirely.
2. Soften hedged claims: prefix with "ممكن يكون..." or "على الأغلب..."
3. Keep all grounded claims unchanged.
4. Compute confidence: (grounded_count / total_claims) × 0.9
   If any claim was not_in_context, cap confidence at 0.6.
5. Set recommend_lawyer to true if confidence < 0.65 or total_claims < 2.
6. Use the submit_synthesis function only.
```

---

## Knowledge Base

### Sources

| Domain | Source | Language |
|--------|--------|----------|
| Family law | Moudawana 2004 + 2025 proposed amendments | Arabic |
| Land and property | Dahir Foncier 1913 + amendments, Collective Land Law, Habous/Waqf | Arabic / French |
| Labour | Code du Travail Law 65-99, CNSS rights, seasonal worker regulations | Arabic / French |
| Civil and debt | Code des Obligations et Contrats, micro-loan agreements | French → translated |
| Procedure | Tribunal locations by wilaya, fee schedules, legal aid contacts | Arabic |

### Chunking strategy

One chunk = one article. Legal text has a natural semantic unit — the article — and preserving it keeps citation grounding traceable. Include the article title and first sentence of adjacent articles as prefix/suffix for cross-article context.

Metadata per chunk:

```json
{
  "article_number": "54",
  "law_name": "مدونة الأسرة",
  "law_code": "moudawana",
  "domain": "family_law",
  "topic_tags": ["divorce", "khul", "talaq"],
  "language": "ar",
  "publication_date": "2004-02-05",
  "source_url": "https://..."
}
```

`publication_date` powers a staleness warning: chunks older than 12 months append "هاد القانون ممكن يكون تبدل — شوف أحدث نسخة" to the answer.

### Running ingestion

```bash
python scripts/ingest_legal_data.py --domain family_law
python scripts/ingest_legal_data.py --domain land
python scripts/ingest_legal_data.py --domain labour
python scripts/ingest_legal_data.py --domain civil_debt

# Or all at once
python scripts/ingest_legal_data.py --all

# Verify counts
python scripts/ingest_legal_data.py --stats
```

---

## Project Structure

```
mizan/
├── backend/
│   ├── main.py                     # FastAPI app, REST + WebSocket
│   ├── database.py                 # SQLAlchemy engine and session
│   ├── schemas.py                  # Pydantic models for all components
│   ├── models/                     # SQLAlchemy models (User, Dossier, etc.)
│   ├── routes/                     # API endpoints (Auth, Intake, Dossiers)
│   ├── agent/
│   │   ├── loop.py                 # Outer orchestration (STT -> Intent -> Debate)
│   │   ├── classifier.py           # Intent classification (Llama 3.3)
│   │   ├── formatter.py            # Literacy-aware register adaptation
│   │   └── debate/
│   │       ├── primary.py          # Primary agent drafter
│   │       ├── devil.py            # Devil's advocate scorer
│   │       └── synthesis.py        # Final synthesis agent
│   ├── knowledge/
│   │   ├── ingest.py               # Document chunking pipeline
│   │   ├── retriever.py            # Hybrid BM25 + Vector search
│   │   └── vector_store.py         # ChromaDB integration
│   ├── speech/
│   │   ├── stt.py                  # Whisper medium (mlx-whisper)
│   │   └── tts.py                  # edge-tts streaming
│   └── profile/
│       └── model.py                # UserProfile persistence (SQLite)
├── mobile/
│   ├── App.tsx                     # Main entry
│   ├── src/
│   │   ├── features/               # Auth, Intake, Dossier features
│   │   └── shared/                 # API client, components
├── scripts/
│   └── ingest_legal_data.py        # CLI for knowledge base ingestion
├── tests/
│   ├── test_debate_loop.py         # Testing the agentic logic
│   └── test_user_routes.py         # Testing API endpoints
├── .env.example
├── Dockerfile
└── docker-compose.yaml
```

---

## Setup & Installation

Mizan is optimized for **Native Execution** to leverage MacBook M4 hardware acceleration for voice tasks.

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 20+** (npm)
- **API Keys**: Groq, Cohere, and Google (see `.env.example`)

### 2. Quick Start
Use the provided `Makefile` for a streamlined setup:

```bash
# Install all dependencies
make setup

# Run both Backend & Mobile
make dev
```

### 3. Manual Startup
If you prefer separate terminals:

**Backend (FastAPI):**
```bash
python3 -m backend.main
```

**Mobile (Expo):**
```bash
cd mobile
npx expo start
```

---

## 🛠️ Development Tools
- `make clean`: Removes caches and local database.
- `make clean-ports`: Force-kills processes on common dev ports (8000, 8081).
- `make backend`: Runs only the API.
- `make mobile`: Runs only the Expo server.

---

## Evaluation

```bash
# Retrieval quality — target Precision@5 ≥ 0.75
python tests/test_retrieval.py --domain family_law

# Debate loop — injects known hallucinated claims, verifies they are removed
python tests/test_debate_loop.py

# Tool compliance — Llama 3.3 must always call the function, never produce free text
python tests/test_tool_schemas.py

# Register adaptation — verifies simpler output for literacy_score < 0.35
python tests/test_register_adapter.py

# End-to-end — 20 scripted conversations, checks classification + citations + register
python tests/test_agent_loop.py
```

---

## Known Limitations

| Limitation | Mitigation |
|-----------|-----------|
| Darija orthography is not standardised | Character-level normalisation at ingestion; Cohere Embed handles variant spellings acceptably |
| Legal text is in MSA Arabic and French | French texts translated to Arabic at ingestion; MSA-heavy answers flagged for review |
| Llama 3.3 free tier: 15 req/min | Sufficient for demo and small-scale use; rate-limit error returns cached answer if available |
| TTS requires connectivity | Text always shown alongside audio; offline mode returns text only |
| No real lawyer validation yet | Answers with confidence < 0.6 pushed to async SQLite review queue for partnered pro-bono lawyers |
| 2025 Moudawana reform still proposed | Chunks labelled `status: proposed`; answers using them carry "هاد القانون ما زال مشروع" warning |
| Whisper medium Arabic WER ~8–12% | Acceptable for legal queries; clarifier asks follow-up if classifier confidence < 0.7 |

---

## Hackathon Pitch — Three Demo Moments

**Problem (30 sec):** 60% of Moroccans live in areas with fewer than 1 lawyer per 10,000 people. Legal aid is urban, expensive, French-language, and MSA. Rural citizens have no access. Mizan changes that — voice-first, Darija-native, and honest about its own confidence. And it runs entirely on free APIs.

**Moment 1 — Structured function calling:**
Ask a question live. Pause and show the raw `submit_legal_answer` JSON in a terminal. Point to the citations array. Say: *"The model cannot answer without citing its sources. That constraint is in the API call, not the prompt."*

**Moment 2 — Debate in action:**
Show a question where the devil's advocate flags one claim as `not_in_context`. Show it disappear from the synthesis output. Say: *"Two AI agents argue about every sentence before the user hears it."*

**Moment 3 — Confidence badge + register:**
Ask the same question with two profiles: rural farmer (literacy 0.2, Khénifra) and Casablanca paralegal (literacy 0.8). Show the judge two completely different answers — different vocabulary, different sentence structure, different use of article numbers. Then show a 🟡 0.51 confidence answer with the "نصحك تمشي للمحامي" banner. Say: *"The system knows what it doesn't know. That's rare in AI products, and in a legal context it matters enormously."*

**Target demo metrics:**
- Latency: < 8 seconds end-to-end on 4G (4s Whisper + ~3s Llama 3.3 × 4 calls)
- Retrieval Precision@5: ≥ 0.75 on labeled test set
- Citation accuracy: 100% — architecturally impossible to hallucinate citations not in retrieved chunks
- Debate loop false-negative rate: < 10%

---

## Task Split — 20-Hour Build Plan

Four developers total: three AI engineers splitting the backend brain, one app developer owning everything the judge sees and touches. All four can work in parallel from hour one with minimal blocking.

Before anyone writes a single function, spend **30 minutes writing `backend/types.py`** together — the shared `Chunk`, `UserProfile`, `FinalAnswer`, and `WebSocketMessage` dataclasses. Every interface contract below depends on these types being agreed upfront.

---

### AI Dev 1 — Multi-Agent Debate Loop 🤖

**Owns:** `backend/agent/debate/`, `backend/tools/`, `backend/prompts/`

| Task | Description | Est. |
|------|-------------|------|
| Function schemas | Write and validate all three schemas: `submit_legal_answer`, `score_claims`, `submit_synthesis`. Add a test confirming Llama 3.3 always calls the function and never emits free text — run this before touching anything else. | 1.5 h |
| System prompts | Write and iterate the three prompts: primary agent in Darija, devil's advocate in English, synthesis mixing both. Tune devil's advocate strictness until the flag rate on test questions is realistic — not 0%, not 80%. | 1.5 h |
| Primary agent | `debate/primary.py` — Llama 3.3 function call #2. Accepts `transcript + chunks + literacy_score`, returns `PrimaryAnswer`. | 1 h |
| Devil's advocate | `debate/devil.py` — Llama 3.3 function call #3. Receives primary answer + raw chunks. Be strict: `grounded` means word-for-word traceable only. | 1.5 h |
| Synthesis agent | `debate/synthesis.py` — Llama 3.3 function call #4. Deletes `not_in_context` claims, softens `hedged` ones, computes confidence and `recommend_lawyer`. | 1 h |
| Debate orchestrator | `debate/loop.py` — wires calls A → B → C, handles retries if a function call fails, returns `FinalAnswer`. | 0.5 h |

**Total: ~7 h**

---

### AI Dev 2 — Knowledge Base & Retrieval 📚

**Owns:** `backend/knowledge/`, `backend/cache/`, `scripts/`

| Task | Description | Est. |
|------|-------------|------|
| Source collection | Download and clean Moudawana, Code du Travail, Dahir Foncier, Code des Obligations. Export to structured plain-text with article boundaries marked. Start immediately — this runs in the background. | 1.5 h |
| Article-level chunker | `ingest.py` — split at article boundaries, attach full metadata. One chunk = one article. | 2 h |
| Cohere embedder | `embedder.py` — Cohere Embed v3 multilingual wrapper. Batch-embed articles, upsert into ChromaDB with one collection per domain. | 1 h |
| BM25 index | One index per domain using `rank_bm25`. Persist to disk. Load on FastAPI startup. | 1 h |
| Hybrid retriever | `retriever.py` — BM25 top-20 + Cohere Embed top-20 → deduplicate → Cohere Rerank → top 5 Chunks. Public interface: `retriever.retrieve(domain, query)`. | 1.5 h |
| Offline cache | `offline_cache.py` — SQLite with top-50 Q&A pairs per domain, RapidFuzz fuzzy matcher, returns answer + `is_cached: true`. | 1 h |

**Total: ~8 h**

---

### AI Dev 3 — Orchestration, Voice Pipeline & User Model 🔗

**Owns:** `backend/main.py`, `backend/agent/loop.py`, `backend/agent/classifier.py`, `backend/speech/`, `backend/profile/`

| Task | Description | Est. |
|------|-------------|------|
| FastAPI server | `main.py` — WebSocket endpoint, startup events (load BM25, warm ChromaDB), error handling, CORS. Write this first — App Dev needs something to connect to. | 1.5 h |
| STT adapter | `speech/stt.py` — mlx-whisper wrapper. Accepts audio binary, emits Darija transcript. | 1 h |
| TTS adapter | `speech/tts.py` — edge-tts `ar-MA-JamalNeural`. Stream first sentence back before full answer is assembled. Degrade to text if offline. | 1 h |
| Intent classifier | `classifier.py` — Llama 3.3 function call #1. Outputs `domain`, `intent`, `confidence`, `missing_context`. | 1 h |
| Clarifier | `clarifier.py` — if `confidence < 0.7`, generate a Darija follow-up question, wait for second input, re-run classifier with enriched context. | 0.5 h |
| Main agent loop | `loop.py` — state machine: transcript → classify → maybe_clarify → retrieve → debate → format → TTS → send `FinalAnswer` over WebSocket. | 1 h |
| Answer formatter | `formatter.py` — reads `user.literacy_score`, maps to register, adjusts Darija sentence complexity and article number prominence. | 1 h |
| User mental model | `profile/model.py` — `UserProfile` dataclass, SQLite persistence, EMA literacy recalculation. Expose `GET /profile/{id}` and `POST /profile/{id}/feedback`. | 0.5 h |

**Total: ~8.5 h**

---

### App Dev — Mobile UI & Demo Polish 📱

**Owns:** `mobile/`

| Task | Description | Est. |
|------|-------------|------|
| Project setup | Expo init, Arabic RTL config (`I18nManager.forceRTL(true)`), NativeWind setup, navigation skeleton. | 1 h |
| Audio recording | `services/audio.ts` — tap-to-record with `expo-av`, encode to Opus 16kbps, stream binary chunks over WebSocket. Show live waveform while recording. | 1.5 h |
| WebSocket client | `services/ws.ts` — connect on launch, handle reconnect, parse incoming `FinalAnswer` JSON and debate step events. | 1 h |
| HomeScreen | Mic button centred on screen, waveform animation, Darija label "اضغط وتكلم", spinner "كيفكر…" while waiting. | 1 h |
| DebatingScreen | **The pitch moment.** Animate three-step timeline in real time: "الوكيل الأول كيكتب الجواب… المحكم كيراجع… التوليف…" with real elapsed-time stamps streamed from backend. Make this screen visually memorable. | 2 h |
| AnswerScreen | Full answer in Darija (RTL, large readable font). Confidence badge (🟢 ≥ 0.75 / 🟡 0.5–0.75 / 🔴 < 0.5). Collapsible "المصادر". "نصحك تمشي للمحامي" banner when flagged. Thumbs up/down. | 2 h |
| Offline mode | NetInfo check on launch. Route query to cached answers and show "محفوظ" badge if offline. | 0.5 h |
| Two-profile toggle | Hidden dev button (triple-tap on logo) switching between "rural farmer" (literacy 0.2, Khénifra) and "Casablanca paralegal" (literacy 0.8). This toggle must exist before rehearsal. | 0.5 h |
| Demo rehearsal | Run the three pitch moments end-to-end on the demo device 10 times. | 1 h |

**Total: ~10.5 h**

---

### Synchronisation Points

| Time | What must be true | Who |
|------|-------------------|-----|
| **Hour 0** | `backend/types.py` written and committed: `Chunk`, `UserProfile`, `FinalAnswer`, `WebSocketMessage`. | All 4 |
| **Hour 2** | AI Dev 2 has family_law domain ingested, `retriever.retrieve()` returning real chunks. AI Dev 3 has FastAPI running, App Dev can send audio and receive a mock response. | AI 2, AI 3, App |
| **Hour 5** | AI Dev 1 has debate loop producing `FinalAnswer` with real confidence scores. First end-to-end text test: type a query in Python → get a `FinalAnswer` with citations. | AI 1, AI 3 |
| **Hour 7** | First full voice-in → Darija-audio-out call working on the demo device, even if rough. | All 4 |
| **Hour 9** | Demo rehearsal. All three moments in sequence, timed. | All 4 |

---

### Addons — If Core Is Done Early ✨

Ranked by demo impact. Do in order, not in parallel.

| Priority | Addon | Owner | Description |
|----------|-------|-------|-------------|
| 1 | Debate timeline with real timestamps | App Dev | DebatingScreen shows actual elapsed milliseconds per step streamed from backend. Turns a loading screen into a window into the AI's reasoning. |
| 2 | Wilaya-aware tribunal lookup | AI Dev 2 | SQLite table mapping Morocco's 12 regions to tribunal address, phone, and hours. Formatter appends the right one based on `user.wilaya`. |
| 3 | Staleness warning | AI Dev 2 + App Dev | Surface "هاد القانون ممكن يكون تبدل" when chunk `publication_date` > 12 months. One metadata check, one UI label. |
| 4 | BM25 Darija normalisation | AI Dev 2 | Normalise orthographic variants before BM25 indexing (ة → ه, أ/إ/آ → ا). Measurably improves keyword recall on real queries. |
| 5 | Pro-bono review queue | AI Dev 3 + App Dev | Backend pushes low-confidence answers to SQLite queue. Minimal admin screen lists flagged answers for a volunteer lawyer to review. |
| 6 | Confidence history sparkline | App Dev | Tiny chart in profile screen showing confidence trend across last 10 queries. |

---

MIT. Legal texts are public domain (official Moroccan legislation published by the government).

---

## Contributing

Priority areas:

1. Additional legal domains — criminal procedure, commercial law, tenancy
2. Darija normalisation dictionary for orthographic variants
3. Pro-bono lawyer review queue UI
4. Whisper medium fine-tune on Moroccan Arabic court recordings
5. Offline cache expansion beyond 50 pairs per domain
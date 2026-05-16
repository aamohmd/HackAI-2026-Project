# ⚖️ Mizan — AI Legal Assistant for Morocco
> Voice-first, Darija-native legal guidance for underserved Moroccan communities  
> **Free-tier stack · Runs on MacBook M4 · Works on 3G and offline**

---

## What makes this different from a chatbot

Most legal AI products are RAG wrappers: user asks a question, the system retrieves chunks, an LLM writes an answer. Mizan has three architectural properties that separate it from that pattern.

**1. Structured tool-use output** — the LLM cannot produce a free-text answer. It is forced, by tool schema, to emit a typed JSON object containing the answer in Darija, an array of article citations with grounding claims, a confidence score, and a boolean flag for whether a real lawyer is recommended. No regex. No post-hoc parsing. Structured by design.

**2. Multi-agent confidence debate** — every answer passes through three sequential LLM calls: a primary agent that drafts, a devil's advocate that scores each claim as \`grounded / hedged / not_in_context\`, and a synthesis agent that removes unsupported claims and produces a final confidence score shown to the user as a badge.

**3. User mental model** — a lightweight profile stored per user tracks literacy level, wilaya, topics asked, and low-confidence interaction count. The answer formatter reads this profile and adjusts Darija register, sentence length, and vocabulary complexity. The system gets better at talking to each person individually over time.

---

## Free Stack — Zero Cost, Zero GPU

Every component runs on free tiers or locally on Apple Silicon. No billing required to build or demo this project.

| Layer | Technology | Cost | Why |
|-------|-----------|------|-----|
| Mobile | React Native + Expo | Free | Single codebase, Arabic RTL, fast iteration |
| Backend | FastAPI + Uvicorn | Free | Async WebSocket, lightweight |
| Orchestration | Plain Python state machine | Free | Debuggable, no framework lock-in |
| LLM | Gemini 2.0 Flash | Free (1M tokens/day) | Function calling, fast, strong Arabic reasoning |
| Embeddings | Cohere Embed v3 multilingual | Free (trial key, no card) | Darija code-switching, handles variant spellings |
| Reranker | Cohere Rerank multilingual v3 | Free (same key) | Arabic-native, no local model needed |
| Vector store | ChromaDB (file-based) | Free | Zero infra, persists to disk |
| Keyword search | rank_bm25 | Free | Catches exact article number citations |
| STT | Whisper medium via mlx-whisper | Free | ~4s on M4 Neural Engine, works offline |
| TTS | edge-tts (\`ar-MA-JamalNeural\`) | Free (no key) | Microsoft Edge TTS public endpoint |
| Audio compression | Opus 16kbps (expo-av) | Free | ~80% smaller than WAV on upload |
| User profile | SQLite | Free | Literacy score, wilaya, feedback log |
| Offline cache | SQLite + RapidFuzz | Free | Fuzzy match, zero connectivity fallback |

**What runs on M4:** Whisper medium (STT) + FastAPI process + ChromaDB reads. Everything cognitively heavy — LLM calls, embeddings, reranking — is offloaded to free cloud APIs.

### Get your free keys

- **Gemini:** https://aistudio.google.com/app/apikey — no billing, no credit card
- **Cohere:** https://dashboard.cohere.com — trial key gives embeddings + rerank free

---

## Architecture

\`\`\`
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
│  │  STT   Whisper medium via mlx-whisper (local, M4)        │    │
│  │        ~4s for 10s clip · works fully offline            │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            │ Darija transcript                    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 1 — Intent classifier  (Gemini function call #1)   │    │
│  │    → domain · intent · confidence · missing_context      │    │
│  │    → if confidence < 0.7: generate clarifying question   │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 2 — Hybrid retriever                               │    │
│  │    Filter to domain namespace in ChromaDB                │    │
│  │    BM25 top-20 + Cohere Embed v3 top-20                  │    │
│  │    Cohere Rerank multilingual → top 5 chunks             │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 3 — Multi-agent confidence debate  ★               │    │
│  │                                                          │    │
│  │  Call A — Primary agent  (Gemini function call #2)       │    │
│  │    Tool: submit_legal_answer                             │    │
│  │    Output: answer_darija · citations[] · confidence      │    │
│  │                     │                                    │    │
│  │                     ▼                                    │    │
│  │  Call B — Devil's advocate  (Gemini function call #3)    │    │
│  │    Tool: score_claims                                    │    │
│  │    Output: grounded | hedged | not_in_context per claim  │    │
│  │                     │                                    │    │
│  │                     ▼                                    │    │
│  │  Call C — Synthesis agent  (Gemini function call #4)     │    │
│  │    Removes not_in_context claims                         │    │
│  │    Softens hedged claims → final confidence score        │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Step 4 — Answer formatter                               │    │
│  │    Reads literacy_score from user mental model           │    │
│  │    Adjusts Darija register + sentence complexity         │    │
│  │    Appends nearest tribunal + hotline by wilaya          │    │
│  │    If recommend_lawyer → adds lawyer referral banner     │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  TTS   edge-tts ar-MA-JamalNeural (streamed)             │    │
│  │        Degrades gracefully to text-only if offline       │    │
│  └─────────────────────────┬────────────────────────────────┘    │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Feedback loop                                           │    │
│  │    Thumbs up/down → update literacy_score + topic log    │    │
│  │    confidence < 0.6 → push to pro-bono review queue      │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐
  │  Gemini API │    │   ChromaDB   │    │    SQLite     │
  │ (4 calls    │    │ (namespaced, │    │ sessions,     │
  │  per query) │    │  file-based) │    │ review queue, │
  └─────────────┘    └──────────────┘    │ offline cache │
                                         └───────────────┘
\`\`\`

---

## Project Structure

\`\`\`text
HackAI-2026-Project/
├── api/                  # FastAPI Backend (Groq, Llama, Whisper)
│   ├── routes/           # API Endpoints
│   ├── services/         # AI Agent Logic
│   └── tests/            # Pytest suite
├── mobile/               # Expo (React Native) App
│   ├── src/              # Source code (TypeScript + NativeWind)
│   └── app/              # Expo Router pages
├── conductor/            # Project planning & standards
├── docker-compose.yaml   # Orchestration for API & DB
└── requirements.txt      # Python dependencies
\`\`\`

---

## Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 20+
- MacBook M4 (or any machine with internet access — M4 is required only for local Whisper)
- Docker & Docker Compose
- Gemini API key (free — https://aistudio.google.com/app/apikey)
- Cohere API key (free — https://dashboard.cohere.com)
- **Expo Go** app on your phone

### 2. Setup
\`\`\`bash
# Clone and install dependencies
pip install fastapi uvicorn websockets google-generativeai cohere \\
            chromadb rank-bm25 rapidfuzz sqlalchemy requests \\
            mlx-whisper edge-tts

cp .env.example .env
# Fill in required keys:
# GEMINI_API_KEY=
# COHERE_API_KEY=
# GROQ_API_KEY=
\`\`\`

### 3. Development Workflow

1.  **Start the Services:** \`docker compose up -d\`
2.  **Start Backend:**
    \`\`\`bash
    # First run: ingest knowledge base (~15 min, one time)
    python scripts/chunk_and_embed.py --all

    # Start server
    uvicorn api.main:app --reload --port 8000
    \`\`\`
3.  **Start Mobile App:**
    \`\`\`bash
    cd mobile
    npm install
    npx expo start
    \`\`\`
    *Scan the QR code with your Expo Go app.*

---

## Connectivity Tiers — Rural Reliability

Mizan degrades gracefully instead of failing silently. Connectivity is checked before every Gemini call.

\`\`\`python
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
\`\`\`

| Result | Pipeline behaviour |
|---|---|
| \`fast\` | Full pipeline — Whisper → Gemini (4 calls) → edge-tts → voice answer |
| \`slow\` | Whisper → Gemini → text answer (TTS skipped to save round-trip) |
| \`offline\` | RapidFuzz fuzzy match against SQLite cache → "محفوظ" badge |

---

## The Three AI Innovations — Deep Dive

### 1. Gemini function calling as a hard architectural constraint

The answer generator does not write free text. It is required to call a function:

\`\`\`python
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
\`\`\`

The same pattern applies to the devil's advocate (\`score_claims\`) and the synthesis agent (\`submit_synthesis\`). Every LLM call in the pipeline is structured. The backend never parses free text.

---

### 2. Multi-agent confidence debate

\`\`\`python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.0-flash")

class DebateLoop:

    def run(self, transcript: str, chunks: list[Chunk], user: UserProfile) -> FinalAnswer:
        primary = self._call_primary(transcript, chunks, user)
        scores  = self._call_devil(primary.answer_darija, chunks)
        final   = self._call_synthesis(primary, scores)
        return final
\`\`\`

The devil's advocate receives the primary answer and the raw retrieved chunks and classifies every factual claim as \`grounded\`, \`hedged\`, or \`not_in_context\`. Claims classified \`not_in_context\` are deleted by the synthesis agent.

---

### 3. User mental model and adaptive register

The answer formatter maps \`literacy_score\` to register:

| Score | Register | Style |
|-------|----------|-------|
| 0.0 – 0.35 | Simple | Short sentences, everyday Darija, article numbers not spoken aloud |
| 0.35 – 0.65 | Standard | Normal Darija, article numbers mentioned once, brief steps |
| 0.65 – 1.0 | Technical | Article numbers prominent, legal terms with brief in-line definitions |

---

## Evaluation

\`\`\`bash
# Retrieval quality — target Precision@5 ≥ 0.75
python tests/test_retrieval.py --domain family_law

# End-to-end — 20 scripted conversations
python tests/test_agent_loop.py
\`\`\`

---

## Git Standards
See [conductor/git-standards.md](conductor/git-standards.md).

## Known Limitations

| Limitation | Mitigation |
|-----------|-----------|
| Darija orthography is not standardised | Character-level normalisation; Cohere Embed handles variations |
| TTS requires connectivity | Text shown alongside audio; offline mode returns text only |
| Gemini free tier: 15 req/min | Rate-limit error returns cached answer if available |

---

## Hackathon Pitch — Three Demo Moments

1. **Structured function calling:** Show raw JSON output in terminal.
2. **Debate in action:** Show flagged claims being removed in real-time.
3. **Adaptive register:** Show different answers for different user profiles.

---

MIT. Legal texts are public domain (official Moroccan legislation).

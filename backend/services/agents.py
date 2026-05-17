import os
import json
import asyncio
from typing import Optional
from pydantic import BaseModel, Field
import google.generativeai as genai
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

# Configure GenAI SDK with GEMINI_API_KEY
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use AsyncGroq - The fastest LLM provider for fact extraction and RAG (non-blocking)
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

class Citation(BaseModel):
    article_number: str
    law_name: str
    law_code: str
    claim_supported: str

class MizanResult(BaseModel):
    answer_darija: str
    answer_verbal: Optional[str] = None
    audio_url: Optional[str] = None
    citations: list[Citation]
    confidence: float
    recommend_lawyer: bool
    answer_register: str # 'simple', 'standard', 'technical'

class LandDisputeState(BaseModel):
    claimant_name: Optional[str] = None
    opponent_name: Optional[str] = None
    location: Optional[str] = None
    date_of_incident: Optional[str] = None
    proof_type: Optional[str] = None # e.g., Moulkiya, Witnesses
    description: Optional[str] = None
    is_complete: bool = False
    interim_citations: Optional[list[Citation]] = None
    mizan_result: Optional[MizanResult] = None

class VerifyChunk(BaseModel):
    article_number: str
    law_name: str
    text: str

MOROCCAN_LAND_LAWS = [
    {"article_number": "Article 1", "law_name": "Dahir on Land Registration", "law_code": "1-11-177", "content": "Registration of land provides absolute proof of ownership and is opposable to third parties."},
    {"article_number": "Article 62", "law_name": "Dahir on Land Registration", "law_code": "1-11-177", "content": "Any real right relating to a registered building exists only by its registration in the land registry."},
    {"article_number": "Article 42", "law_name": "Code of Real Rights", "law_code": "39-08", "content": "Ownership of land includes the space above and the ground below."},
    {"article_number": "Article 3", "law_name": "Code of Real Rights", "law_code": "39-08", "content": "Possession (L-hiaza) must be peaceful, public, and continuous for 10 years to create a presumption of ownership between individuals."}
]

SYSTEM_PROMPT_EXTRACTOR = """
You are a legal paralegal assistant specialized in Moroccan land disputes. 
Your task is to extract facts from a user's testimony transcript.
Update the current state JSON based on the new transcript.
Do not hallucinate facts. If information is missing, leave it as null.
Transcript language: Moroccan Darija (transcribed).
Output MUST be a valid JSON matching the schema.
"""

SYSTEM_PROMPT_INTERVIEWER = """
You are Mizan, a supportive legal counselor in rural Morocco. 
The user is a farmer or villager who might be illiterate. 
Speak in friendly, clear Moroccan Darija (written phonetically).
Your goal is to listen to their story and help them build a legal brief.
Based on the current extracted facts, identify what is missing and ask ONE follow-up question.
Missing facts prioritize: Location, Opponent Name, Proof Type.
If all major facts are present, thank the user and say their dossier is sealed and ready for the judge.
"""

# ─────────────────────────────────────────────
# TOOL SCHEMA — PRIMARY AGENT
# ─────────────────────────────────────────────

TOOL_SUBMIT_LEGAL_ANSWER = {
    "name": "submit_legal_answer",
    "description": (
        "Submit the final structured legal answer. "
        "You MUST use this tool — never write free text. "
        "Every claim must include the chunk_index and key_terms that prove it."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "answer_darija": {
                "type": "string",
                "description": (
                    "الجواب القانوني الرسمي بالعربية الفصحى المبسطة. "
                    "استخدم Markdown: ## العناوين، - النقاط. "
                    "اذكر كل مادة قانونية بالضبط مع رقم الفصل."
                ),
            },
            "answer_verbal": {
                "type": "string",
                "description": (
                    "الجواب الشفهي بالدارجة المغربية الحقيقية. "
                    "دافئ، بسيط، بدون Markdown، مناسب للاستماع. "
                    "ابدأ بجملة تطمينية. اختم بتشجيع."
                ),
            },
            "next_steps": {
                "type": "string",
                "description": (
                    "جملتين أو ثلاثة بالدارجة — شنو خاص المستخدم يدير دابا؟ "
                    "مثال: روح للمحكمة الابتدائية وجيب معك بطاقة التعريف الوطنية."
                ),
            },
            "cited_articles": {
                "type": "array",
                "description": "All law articles explicitly cited in the answer.",
                "items": {
                    "type": "object",
                    "properties": {
                        "law_name":       {"type": "string"},
                        "article_number": {"type": "string"},
                    },
                    "required": ["law_name", "article_number"],
                },
            },
            "claims": {
                "type": "array",
                "description": (
                    "Every factual legal claim in the answer. "
                    "Each claim MUST reference the exact chunk that supports it."
                ),
                "items": {
                    "type": "object",
                    "properties": {
                        "claim_text": {
                            "type": "string",
                            "description": "The factual claim, written in English.",
                        },
                        "chunk_index": {
                            "type": "integer",
                            "description": (
                                "0-based index of the source chunk that supports this claim. "
                                "Must match a [Chunk N] from the provided list."
                            ),
                        },
                        "key_terms": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": (
                                "2-4 exact words or short phrases copied from that chunk. "
                                "Used for deterministic verification — be precise."
                            ),
                        },
                    },
                    "required": ["claim_text", "chunk_index", "key_terms"],
                },
            },
        },
        "required": [
            "answer_darija",
            "answer_verbal",
            "next_steps",
            "cited_articles",
            "claims",
        ],
    },
}

# ─────────────────────────────────────────────
# SYSTEM PROMPTS
# ─────────────────────────────────────────────

SYSTEM_PRIMARY = """أنت "ميزان"، مساعد قانوني مغربي موثوق ودقيق.
مهمتك تساعد المواطنين المغاربة يفهمو حقوقهم القانونية بشكل واضح وصحيح.

القواعد الأساسية:
1. استعمل دايما الأداة submit_legal_answer — ما تكتبش جواب حر أبدا.
2. ما تعطيش معلومة قانونية إلا إذا كانت موجودة في النصوص المعطاة.
3. كل claim خاصها chunk_index وkey_terms من النص الأصلي.
4. إذا ما لقيتيش المعلومة، قول بصراحة "ما عنديش معلومة كافية في هاد الموضوع".
5. ما تتصورش أنك محامي — أنت كتعطي معلومات، مش مشورة قانونية.
6. إذا كان literacy_score < 0.4: بسّط الكلام أكثر في answer_verbal.
7. النبرة في answer_verbal: صديق يشرح، مش أستاذ يحاضر.
"""

# ─────────────────────────────────────────────
# PROMPT BUILDER
# ─────────────────────────────────────────────

def build_primary_prompt(
    transcript: str,
    chunks: list[VerifyChunk],
    literacy_score: float,
) -> str:
    chunks_text = "\n\n---\n\n".join([
        f"[Chunk {i}]\nLaw: {c.law_name}\nArticle: {c.article_number}\nText: {c.text}"
        for i, c in enumerate(chunks)
    ])
    return (
        f"السؤال: {transcript}\n\n"
        f"مستوى القراءة (0-1): {literacy_score}\n\n"
        f"النصوص القانونية المتاحة ({len(chunks)} نص):\n\n"
        f"{chunks_text}"
    )

# ─────────────────────────────────────────────
# GEMINI CALLER (async wrapper)
# ─────────────────────────────────────────────

async def _call_gemini(
    system: str,
    prompt: str,
    tool: dict,
    tool_name: str,
    tool_mode: str = "ANY",
) -> Optional[dict]:
    """
    Async wrapper around the sync Gemini SDK.
    Returns the tool call arguments dict, or None if the model didn't call the tool.
    """
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=system,
        tools=[{"function_declarations": [tool]}],
        tool_config={"function_calling_config": {"mode": tool_mode}},
    )

    response = await asyncio.get_event_loop().run_in_executor(
        None, lambda: model.generate_content(prompt)
    )

    for part in response.candidates[0].content.parts:
        if hasattr(part, "function_call") and part.function_call.name == tool_name:
            return dict(part.function_call.args)

    return None

# ─────────────────────────────────────────────
# AGENT 1 — PRIMARY (LLM)
# ─────────────────────────────────────────────

async def run_primary_agent(
    transcript: str,
    chunks: list[VerifyChunk],
    literacy_score: float = 0.5,
) -> dict:
    prompt = build_primary_prompt(transcript, chunks, literacy_score)
    result = await _call_gemini(
        system=SYSTEM_PRIMARY,
        prompt=prompt,
        tool=TOOL_SUBMIT_LEGAL_ANSWER,
        tool_name="submit_legal_answer",
        tool_mode="ANY",
    )
    if result is None:
        raise ValueError("Primary agent did not call submit_legal_answer.")
    return result

# ─────────────────────────────────────────────
# AGENT 2 — PYTHON VERIFIER (deterministic, 0ms)
# ─────────────────────────────────────────────

def verify_citations(claims: list[dict], chunks: list[VerifyChunk]) -> dict:
    """
    Pure Python — no LLM, no latency.
    For each claim, checks that the cited chunk actually contains the key_terms.
    """
    if not claims:
        return {
            "verdicts": [],
            "confidence": 0.0,
            "recommend_lawyer": True,
            "grounded_count": 0,
            "hedged_count": 0,
            "removed_count": 0,
        }

    verdicts = []

    for claim in claims:
        idx       = claim.get("chunk_index", -1)
        key_terms = claim.get("key_terms", [])

        # Invalid chunk reference
        if not isinstance(idx, int) or idx < 0 or idx >= len(chunks):
            verdicts.append({**claim, "verdict": "not_in_context"})
            continue

        # No key terms provided — conservative hedge
        if not key_terms:
            verdicts.append({**claim, "verdict": "hedged"})
            continue

        chunk_text = chunks[idx].text.lower()
        matched    = sum(1 for t in key_terms if t.lower() in chunk_text)
        ratio      = matched / len(key_terms) if key_terms else 0.0

        if ratio >= 0.66:
            verdict = "grounded"
        elif ratio > 0:
            verdict = "hedged"
        else:
            verdict = "not_in_context"

        verdicts.append({**claim, "verdict": verdict})

    total    = len(verdicts)
    grounded = sum(1 for v in verdicts if v["verdict"] == "grounded")
    hedged   = sum(1 for v in verdicts if v["verdict"] == "hedged")
    removed  = sum(1 for v in verdicts if v["verdict"] == "not_in_context")

    confidence = round((grounded / total) * 0.9, 3) if total > 0 else 0.0
    if removed > 0:
        confidence = min(confidence, 0.6)

    return {
        "verdicts":        verdicts,
        "confidence":      confidence,
        "recommend_lawyer": confidence < 0.65 or total < 2,
        "grounded_count":  grounded,
        "hedged_count":    hedged,
        "removed_count":   removed,
    }

def apply_hedging_disclaimer(answer_verbal: str, verdicts: list[dict]) -> str:
    """
    Appends Darija disclaimer sentences based on verification results.
    Keeps the verbal answer natural.
    """
    removed = [v for v in verdicts if v["verdict"] == "not_in_context"]
    hedged  = [v for v in verdicts if v["verdict"] == "hedged"]

    parts = []
    if hedged:
        parts.append(
            "خود بالك: بعض المعلومات ممكنة بناءً على النصوص، "
            "ولكن مش مؤكدة بالكامل."
        )
    if removed:
        parts.append(
            "بعض النقاط ما عندناش نص قانوني يؤكدها — "
            "نصحك تتحقق مع محامي أو الوكيل القضائي فبلادك."
        )

    if parts:
        return answer_verbal.rstrip() + "\n\n" + " ".join(parts)
    return answer_verbal

# ─────────────────────────────────────────────
# RAG SEARCH PIPELINE
# ─────────────────────────────────────────────

async def search_relevant_laws(description: str) -> list[Citation]:
    # Simulated RAG: Use LLM to find which mock laws apply
    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Identify which Moroccan law articles from this list apply to the case. Output JSON list of citations."},
                {"role": "user", "content": f"Laws: {MOROCCAN_LAND_LAWS}\nCase: {description}"}
            ],
            response_format={"type": "json_object"}
        )
        # Parse and return Citations
        data = json.loads(response.choices[0].message.content)
        citations_data = data.get("citations", data.get("articles", []))
        return [Citation(**c) for c in citations_data if isinstance(c, dict)]
    except Exception as e:
        print(f"RAG Error: {e}")
        return []

# ─────────────────────────────────────────────
# FULL DUAL-TRACK PIPELINE
# ─────────────────────────────────────────────

async def generate_final_brief(state: LandDisputeState) -> MizanResult:
    """
    Full lean pipeline:
      Step 1 — Primary Agent (LLM Gemini 2.0 Flash)
      Step 2 — Python Verifier (pure string match)
    """
    # Build chunks list from state's interim citations and MOROCCAN_LAND_LAWS
    chunks = []
    for citation in (state.interim_citations or []):
        matched_content = citation.claim_supported
        for law in MOROCCAN_LAND_LAWS:
            if law["article_number"].lower() == citation.article_number.lower():
                matched_content = law["content"]
                break
        chunks.append(VerifyChunk(
            article_number=citation.article_number,
            law_name=citation.law_name,
            text=matched_content
        ))

    # ── Step 1: Primary Agent ─────────────────
    try:
        primary = await run_primary_agent(state.description or "", chunks)
    except Exception as e:
        print(f"[PRIMARY AGENT ERROR] {e}")
        return MizanResult(
            answer_darija    = "عذرا، حدث خطأ تقني. يرجى المحاولة مرة أخرى.",
            answer_verbal    = "سامحني، كاين مشكل تقني دابا. حاول مرة أخرى.",
            citations        = [],
            confidence       = 0.0,
            recommend_lawyer = True,
            answer_register  = "simple"
        )

    # ── Step 2: Python Verifier ───────────────
    # Normalize Gemini MapComposite → plain dicts
    raw_claims = [dict(c) for c in primary.get("claims", [])]
    # Normalize key_terms: Gemini may return RepeatedComposite
    for c in raw_claims:
        c["key_terms"] = list(c.get("key_terms", []))

    verification      = verify_citations(raw_claims, chunks)
    answer_verbal_clean = apply_hedging_disclaimer(
        primary.get("answer_verbal", ""),
        verification["verdicts"]
    )
    
    # Append friendly re-explain suffix trigger
    if answer_verbal_clean and not answer_verbal_clean.endswith("جديد") and not answer_verbal_clean.endswith("أسهل."):
        answer_verbal_clean = answer_verbal_clean + "\n\nإلى ما فهمتيش هاد الشي، غير قولها ليا ونعاود نشرح ليك بطريقة أسهل."

    # Append next steps to answer_darija
    next_steps = primary.get("next_steps", "")
    answer_darija = primary.get("answer_darija", "")
    if next_steps:
        answer_darija += f"\n\n## الخطوات المقبلة\n- {next_steps}"

    # Build Pydantic Citations
    citations = []
    for c in (state.interim_citations or []):
        citations.append(Citation(
            article_number=c.article_number,
            law_name=c.law_name,
            law_code=c.law_code or "N/A",
            claim_supported=c.claim_supported
        ))

    return MizanResult(
        answer_darija    = answer_darija,
        answer_verbal    = answer_verbal_clean,
        citations        = citations,
        confidence       = verification["confidence"],
        recommend_lawyer = verification["recommend_lawyer"],
        answer_register  = "standard",
    )

# ─────────────────────────────────────────────
# MAIN INTENT EXTRACTION & INTERVIEW PIPELINE
# ─────────────────────────────────────────────

async def extract_facts(transcript: str, current_state: LandDisputeState) -> LandDisputeState:
    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_EXTRACTOR},
                {"role": "user", "content": f"Current State: {current_state.model_dump_json()}\nNew Transcript: {transcript}"}
            ],
            response_format={"type": "json_object"}
        )
        updated_data = response.choices[0].message.content
        new_state = LandDisputeState.model_validate_json(updated_data)
        
        # Add interim citations if description is available
        if new_state.description:
            new_state.interim_citations = await search_relevant_laws(new_state.description)
            
        # Check if complete and generate result
        if new_state.is_complete and not new_state.mizan_result:
            new_state.mizan_result = await generate_final_brief(new_state)
            
        return new_state
    except Exception as e:
        print(f"Error extracting facts: {e}")
        return current_state

async def get_next_question(state: LandDisputeState) -> str:
    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant", # Ultra-fast for chat responses
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_INTERVIEWER},
                {"role": "user", "content": f"Current State: {state.model_dump_json()}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting next question: {e}")
        return "Mumkin t-zid t-sharrah liya ktar? (Can you explain more to me?)"

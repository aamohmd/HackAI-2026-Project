# Design Spec: Rural Rights Advocate - Agentic Interviewer

## 1. Project Overview
A 24-hour hackathon project ("Rural Justice Kiosk") designed for Moroccan rural populations. The app uses an agentic AI chain to conduct legal intake interviews via voice, specifically targeting Land Disputes (Moulkiya/Boundary issues).

## 2. Target Persona & UX
*   **User:** Illiterate or low-literacy farmers in Morocco.
*   **Primary Interface:** "Push-to-Talk" (PTT) Voice Hub.
*   **Language:** Moroccan Darija (Input/Feedback) -> Modern Standard Arabic/French (Final Brief).
*   **Success Metric:** A professional "Case Brief" generated from a messy voice testimony.

## 3. System Architecture

### A. Frontend (React PWA)
*   **Layout:** Mobile-First, Single-Page Action Hub.
*   **Components:**
    *   `VoiceRecorder`: Captures audio while the button is pressed.
    *   `StatusPulse`: Visual feedback for "Listening", "Transcribing", "Thinking".
    *   `ProgressGrid`: A Bento-style grid showing extracted facts (Who, What, Where) as they are found.
    *   `AudioFeedback`: Uses OpenAI TTS to play back the AI's follow-up questions in Darija.

### B. Backend (FastAPI)
*   **Endpoints:**
    *   `POST /api/intake/voice`: Receives audio, returns updated "Case State" and the next follow-up question.
    *   `GET /api/intake/brief`: Generates the final PDF/Document.
*   **Logic:**
    *   **Whisper API:** Transcription of Darija.
    *   **Extraction Agent:** Parses text into a structured JSON schema.
    *   **State Manager:** Tracks which facts are missing (e.g., "Missing: Location").
    *   **Interviewer Agent:** Generates a friendly, supportive follow-up question in Darija based on missing facts.

## 4. Agentic Chain Logic (The "Brain")
1.  **Fact Extractor (LLM):** "Given this transcript, extract: [Name, Location, Date, Opponent, Grievance Type]."
2.  **Missing Fact Checker (Logic):** Identify empty fields in the schema.
3.  **Interview Strategy (LLM):** "The user hasn't mentioned *where* the land is. Ask a polite question in Darija to find out."

## 5. Demo Scenario: The Moroccan Land Dispute
*   **Story:** Neighbor moved a fence near the family's olive grove.
*   **Facts to find:** Neighbor's name, approximate date, presence of "Moulkiya" documents.
*   **End Goal:** A professional document for a lawyer to start a "Boundary Rectification" claim.

## 6. Business Model
*   **Sustainability:** SaaS subscription for Legal Aid NGOs.
*   **Access:** Zero-cost for farmers; referral fees from private lawyers for "Pre-Packaged" case briefs.

## 7. Implementation Roadmap (24h)
*   **Hour 0-4:** Setup FastAPI + OpenAI Whisper/GPT integration.
*   **Hour 4-12:** Build the Mobile-First PTT UI and "Progress Cards."
*   **Hour 12-18:** Refine the "Interview Logic" (State Machine).
*   **Hour 18-24:** Final Styling, PWA manifest, and Demo preparation.

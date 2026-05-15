# Rural Rights Advocate - HackAI 2026

## The Vision
In Morocco's "Legal Deserts," millions of rural citizens lack access to qualified legal counsel. This leads to land encroachment, labor exploitation, and lost rights. **Rural Rights Advocate** is an AI-powered "Justice Kiosk" that uses a multi-agentic voice-first interview to bridge this gap.

## How it Works
1.  **Voice Intake:** A farmer speaks their grievance in **Moroccan Darija**. No literacy required.
2.  **Agentic Extraction:** A GPT-4o-mini agent extracts core legal facts (Who, What, Where, When).
3.  **Intelligent Interview:** The AI identifies missing facts and asks follow-up questions in Darija to build a complete case.
4.  **Professional Briefing:** The final output is a formal, professional Legal Brief in Modern Standard Arabic or French, ready for a lawyer or NGO worker.

## The Business Model (Justice-as-a-Service)
*   **B2B SaaS:** NGOs and Legal Aid societies pay for the platform to 10x their field workers' efficiency.
*   **Referral Network:** Private lawyers pay a subscription to access "Pre-Packaged" case briefs, reducing their intake overhead.
*   **Social Impact:** Zero cost for the rural poor.

## Technical Stack
*   **Backend:** FastAPI (Python)
*   **Agents:** OpenAI GPT-4o-mini (Orchestration & Logic)
*   **Audio:** OpenAI Whisper (Transcription) & TTS-1 (Verbal Feedback)
*   **Frontend:** React PWA (Vite + Tailwind) - Mobile First.
*   **Database:** PostgreSQL (SQLAlchemy)

## 24h Hackathon Deliverables
- [x] **Phone-Based Authentication:** Realistic rural access.
- [x] **Push-to-Talk Interview Hub:** Optimized for mobile.
- [x] **Agentic Fact Extraction:** Turning messy stories into structured data.
- [x] **PWA Support:** Installable on any phone.
- [x] **Real-time Feedback Grid:** Visualizing the AI's "Thought Process."

**Built with ❤️ for rural communities by the HackAI 2026 Team.**

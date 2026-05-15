# Rural Rights Advocate: 24h Hackathon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a voice-first "Legal Kiosk" MVP that conducts automated land-dispute interviews in Moroccan Darija and generates formal legal briefs.

**Architecture:** A FastAPI backend orchestrates a multi-step agentic chain (Transcription -> Extraction -> Next Question Generation). The React PWA provides a mobile-first "Push-to-Talk" interface with real-time feedback cards.

**Tech Stack:** FastAPI, OpenAI (Whisper, GPT-4o-mini, TTS-1), React, Tailwind CSS, Lucide Icons.

---

### Task 1: Phone-Based Auth & User Model Refactor

**Files:**
- Modify: `api/models/user.py`
- Modify: `api/routes/auth.py`
- Modify: `api/schemas.py`

- [ ] **Step 1: Update User Model**
Replace `email` with `phone_number`.
```python
# api/models/user.py
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False) # Changed
    hashed_password = Column(String, nullable=False)
    # ... rest of fields
```

- [ ] **Step 2: Update Schemas**
Update `UserCreate` and `UserRead`.
```python
# api/schemas.py
class UserCreate(BaseModel):
    phone_number: str
    password: str

class UserRead(BaseModel):
    id: str
    phone_number: str
    full_name: str | None = None
    # ...
```

- [ ] **Step 3: Refactor Auth Routes**
Update registration and login to use `phone_number`. Implement "Mock OTP" logging.
```python
# api/routes/auth.py
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check phone instead of email
    db_user = db.query(User).filter(User.phone_number == user.phone_number).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone already registered")
    # Log simulated OTP
    print(f"[SMS SIMULATION] Sent verification code 1234 to {user.phone_number}")
    # ... save user
```

- [ ] **Step 4: Commit**
`git add api/models/user.py api/routes/auth.py api/schemas.py && git commit -m "feat: switch to phone-based auth"`

---

### Task 2: The Agentic Brain (Extraction & Logic)

**Files:**
- Create: `api/services/agents.py`

- [ ] **Step 1: Define Case Schema**
Create a helper to manage the state of the land dispute.
```python
# api/services/agents.py
from pydantic import BaseModel

class LandDisputeState(BaseModel):
    claimant_name: str | None = None
    opponent_name: str | None = None
    location: str | None = None
    date_of_incident: str | None = None
    proof_type: str | None = None # e.g., Moulkiya, Witnesses
    description: str | None = None
    is_complete: bool = False
```

- [ ] **Step 2: Implement Extraction Agent**
Uses GPT-4o-mini to fill the schema from a transcript.
```python
# api/services/agents.py
def extract_facts(transcript: str, current_state: LandDisputeState) -> LandDisputeState:
    # Prompt GPT to update JSON based on transcript
    # ...
    return updated_state
```

- [ ] **Step 3: Implement Interviewer Agent**
Generates the next question in Darija if facts are missing.
```python
# api/services/agents.py
def get_next_question(state: LandDisputeState) -> str:
    if not state.location:
        return "Fin kaynin had l-ard b-dabt? (Where exactly is this land?)"
    # ...
    return "Baraka llahu fik. Ghadi n-wejdu l-melaf dyalek daba."
```

- [ ] **Step 4: Commit**
`git add api/services/agents.py && git commit -m "feat: implement agentic extraction and interview logic"`

---

### Task 3: Voice Intake API

**Files:**
- Create: `api/routes/intake.py`
- Modify: `api/main.py`

- [ ] **Step 1: Create Voice Endpoint**
Handle audio upload, transcribe with Whisper, run agents, and return TTS audio.
```python
# api/routes/intake.py
@router.post("/voice")
async def process_voice(file: UploadFile, state: str = Form(...)):
    # 1. Transcribe audio to text (Whisper)
    # 2. Extract facts using agents.py
    # 3. Get next question string
    # 4. Generate TTS audio for the question (OpenAI TTS)
    # 5. Return JSON: { updated_state, audio_url, transcription }
```

- [ ] **Step 2: Register Router**
```python
# api/main.py
from .routes import intake
app.include_router(intake.router, prefix="/api/intake")
```

- [ ] **Step 3: Commit**
`git add api/routes/intake.py api/main.py && git commit -m "feat: add voice intake API with transcription and agents"`

---

### Task 4: Mobile-First "Kiosk" Frontend

**Files:**
- Create: `frontend/src/pages/MobileHub.tsx`
- Create: `frontend/src/features/intake/components/VoiceRecorder.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create Mobile Hub Layout**
A clean, focused page with a large microphone button and Bento-style progress cards.
```tsx
// frontend/src/pages/MobileHub.tsx
export const MobileHub = () => {
  return (
    <div className="flex flex-col h-screen p-4 bg-mist-50">
       <Header title="Rural Rights Advocate" />
       <ProgressGrid facts={currentFacts} />
       <div className="mt-auto pb-12">
         <VoiceRecorder onResult={handleResult} />
       </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement Voice Recorder**
Standard `MediaRecorder` API that sends `.wav` or `.webm` blobs to the backend.
```tsx
// frontend/src/features/intake/components/VoiceRecorder.tsx
// ... handle push-to-talk logic
```

- [ ] **Step 3: Setup App Routing & Mobile Detection**
Redirect mobile users to the Hub.
```tsx
// frontend/src/App.tsx
const isMobile = window.innerWidth < 768;
return (
  <Routes>
    <Route path="/" element={isMobile ? <MobileHub /> : <Landing />} />
    {/* ... */}
  </Routes>
)
```

- [ ] **Step 4: Commit**
`git add frontend/src/pages/MobileHub.tsx frontend/src/features/intake/components/VoiceRecorder.tsx frontend/src/App.tsx && git commit -m "feat: build mobile hub and voice recorder interface"`

---

### Task 5: Final Polish & PWA Manifest

**Files:**
- Create: `frontend/public/manifest.json`
- Modify: `frontend/index.html`

- [ ] **Step 1: Create PWA Manifest**
```json
// frontend/public/manifest.json
{
  "name": "Rural Rights Advocate",
  "short_name": "RightsApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [ ... ]
}
```

- [ ] **Step 2: Link Manifest in HTML**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0ea5e9">
```

- [ ] **Step 3: Commit**
`git add frontend/public/manifest.json frontend/index.html && git commit -m "chore: enable PWA for mobile installation"`

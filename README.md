# HackAI-2026: Sidi El Qadi

A voice-first AI legal assistant for rural Morocco, focused on mobile-native accessibility.

## Project Structure

```text
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
```

## Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for Mobile)
- Expo Go app on your phone

### 2. Setup
```bash
cp .env.example .env
# Fill in GROQ_API_KEY
```

### 3. Development Workflow

1.  **Start the Services:** `docker compose up -d`
2.  **Start Mobile App:**
    ```bash
    cd mobile
    npm install
    npx expo start
    ```

## Git Standards
See [conductor/git-standards.md](conductor/git-standards.md).

## License
MIT

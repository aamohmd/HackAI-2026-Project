# HackAI-2026 Project

This is the boilerplate project for the HackAI 2026 Hackathon. It features a FastAPI backend, a React (Vite) frontend, and a PostgreSQL database, all containerized with Docker.

## Project Structure

```text
HackAI-2026-Project/
├── api/                  # FastAPI Backend
│   ├── routes/           # API Endpoints
│   ├── database.py       # SQLAlchemy setup
│   ├── main.py           # App entry point
│   ├── models.py         # DB Models
│   └── schemas.py        # Pydantic Schemas
├── frontend/             # React (Vite) Frontend
│   ├── src/              # Source code (TypeScript)
│   ├── Dockerfile.dev    # Dev-specific Dockerfile
│   └── vite.config.ts    # Vite config with backend proxy
├── conductor/            # Project planning & standards
├── docker-compose.yaml   # Orchestration for API, DB, and Frontend
├── Makefile              # Shortcut commands for development
└── requirements.txt      # Python dependencies
```

## Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 20+

### 2. Setup
Copy the example environment file and fill in your local values:
```bash
cp .env.example .env
```

### 3. Development Workflow (Recommended)

For the best developer experience (Fast HMR), run the database in Docker but run the applications natively:

1.  **Start the DB:** `make up-db`
2.  **Install Deps:** `make install`
3.  **Run Backend:** `make dev-backend`
4.  **Run Frontend:** `make dev-frontend`

The frontend will be at `http://localhost:5173` and the backend at `http://localhost:8000`.

### 4. Full Docker Execution (Production-like)

To run everything in isolated containers:
```bash
make up
```

## Git Standards

We follow a strict branching and commit strategy. See [conductor/git-standards.md](conductor/git-standards.md) for details.

- **Main Branch:** `main`
- **Development Branch:** `dev`
- **Feature Branches:** `feat/feature-name`

## License
MIT

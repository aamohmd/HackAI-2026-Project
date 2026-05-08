HackAI-2026-Project/
├── app/
│   ├── __init__.py           # Makes 'app' a Python package
│   ├── main.py               # Application entry point & route definitions
│   ├── database.py           # SQLAlchemy configuration & DB session logic
│   ├── models.py             # Database tables (SQLAlchemy ORM)
│   └── schemas.py            # Data validation & serialization (Pydantic)
├── .env                      # Local environment variables (secrets/configs)
├── .gitignore                # Ensures 'venv' and '__pycache__' aren't committed
├── Dockerfile                # Instructions for building the FastAPI image
├── docker-compose.yml        # Orchestrates the API and PostgreSQL containers
├── requirements.txt          # Python dependencies
└── README.md                 # Setup instructions for the team
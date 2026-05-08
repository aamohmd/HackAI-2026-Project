from fastapi import FastAPI
from .database import engine, Base
from .routes import auth
from . import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HackAI 2026 API")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(auth.router)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .database import engine, Base
from .routes import auth, users, intake, dossiers
from . import models

from .limiter import limiter
from .utils import ensure_upload_dir, UPLOAD_DIR

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    # Ensure upload directory exists
    ensure_upload_dir()
    yield

app = FastAPI(title="Mizan API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
# In production, this should be restricted to your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
ensure_upload_dir()
app.mount(f"/{UPLOAD_DIR}", StaticFiles(directory=UPLOAD_DIR), name=UPLOAD_DIR)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(auth.router)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(intake.router, tags=["intake"])
app.include_router(dossiers.router, tags=["dossiers"])

from .agent.loop import AgentLoop
from .profile.model import get_profile, UserProfile

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    logger.info(f"WebSocket client connected: {user_id}")
    
    profile = get_profile(user_id)
    if not profile:
        profile = UserProfile(user_id=user_id, wilaya="casablanca")
        
    try:
        while True:
            # The client sends audio chunks as bytes
            data = await websocket.receive_bytes()
            logger.info(f"Received audio chunk of {len(data)} bytes")
            
            # Save temporarily for processing
            temp_dir = "/tmp"
            if not os.path.exists(temp_dir):
                os.makedirs(temp_dir)
            temp_path = os.path.join(temp_dir, f"{user_id}_audio.webm")
            with open(temp_path, "wb") as f:
                f.write(data)
            
            # Run the agent loop
            agent = AgentLoop(temp_path, profile)
            async for event in agent.run():
                await websocket.send_json(event)
                
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)


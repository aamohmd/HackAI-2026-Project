from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Mizan API", description="AI Legal Assistant for Morocco")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Placeholder for AI Dev 2's knowledge base initialization
    logger.info("Initializing knowledge base (BM25, ChromaDB)...")

@app.get("/health")
async def health():
    return {"status": "ok"}

import os
from backend.agent.loop import AgentLoop
from backend.profile.model import get_profile, UserProfile

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
            
            # Save temporarily for mlx_whisper
            temp_path = f"/tmp/{user_id}_audio.webm"
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

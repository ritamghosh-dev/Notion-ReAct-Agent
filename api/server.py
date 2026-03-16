import os
from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any
from agent.bot import create_react_agent_custom
from utils.logger import get_logger
from tools.notion_calendar import get_calendar_events, add_calendar_event
from tools.notion_notes import get_notes, add_notes
from tools.weather import get_weather


logger = get_logger(__name__)

app = FastAPI(title="ReAct Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        # "http://localhost:5174",
        # "http://localhost:5175",
        # "http://localhost:5176",
        # "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = None

@app.on_event("startup")
async def startup_event():
    global agent
    try:
        agent = create_react_agent_custom()
        logger.info("Agent initialised in API")
    except Exception as e :
        logger.error(f"Failed to initialize agent:{e}")
        pass

class ChatRequest(BaseModel):
    messages : str
    history: Optional[List[Dict[str, Any]]] = None

@app.post("/chat")
async def chat(request: ChatRequest):
    global agent
    if not agent:
        raise HTTPException(status_code = 500, detail="Agent not initialised")
    try:
        # Build the full message history for the agent
        langchain_messages = []

        # Add conversation history if provided
        if request.history:
            for msg in request.history[:-1]:  # Exclude the last msg (it's the current one)
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if isinstance(content, str) and content.strip():
                    if role == "assistant":
                        langchain_messages.append(("assistant", content))
                    else:
                        langchain_messages.append(("user", content))

        # Add the current user message
        langchain_messages.append(("user", request.messages))

        response = agent.invoke({"messages": langchain_messages})
        if isinstance(response,dict) and "messages" in response:
            messages = response["messages"]
            if messages:
                last_msg = messages[-1]
                content = last_msg.content
                # LangChain can return content as a list of blocks
                if isinstance(content, list):
                    text_parts = []
                    for block in content:
                        if isinstance(block, dict) and "text" in block:
                            text_parts.append(block["text"])
                        elif isinstance(block, str):
                            text_parts.append(block)
                    content = "\n".join(text_parts)
                elif not isinstance(content, str):
                    content = str(content)
                return {"response": content}
        return {"response": "No response from agent."}
    except Exception as e:
        logger.error(f"Error during chat:{e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/calendar")
def get_calendar(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    """Get calendar events for a specific date."""
    try:
        # The tool returns a dict or error string, handle both
        result = get_calendar_events.invoke({"date": date})
        if isinstance(result, dict) and "error" in result:
             raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Error fetching calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notes")
def get_pending_notes():
    """Get all pending notes."""
    try:
        notes = get_notes.invoke({})
        if isinstance(notes, list) and len(notes) > 0 and isinstance(notes[0], str) and notes[0].startswith("Error"):
             raise HTTPException(status_code=400, detail=notes[0])
        return {"notes": notes}
    except Exception as e:
        logger.error(f"Error fetching notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status":"ok"}

# --- Serve the React frontend ---
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

if STATIC_DIR.exists():
    # Mount the assets directory (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    # Catch-all: serve index.html for any non-API route (React client-side routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If the requested file exists in static dir, serve it directly
        file_path = STATIC_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # Otherwise, serve index.html (let React handle routing)
        return FileResponse(STATIC_DIR / "index.html")

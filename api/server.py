from fastapi import FastAPI, HTTPException, Query
from typing import List, Optional, Dict, Any
from agent.bot import create_react_agent_custom
from utils.logger import get_logger
from tools.notion_calendar import get_calendar_events, add_calendar_event
from tools.notion_notes import get_notes, add_notes
from tools.weather import get_weather


logger = get_logger(__name__)

app = FastAPI(title="ReAct Agent API")

agent = None




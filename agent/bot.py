import os
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from tools.weather import get_weather
from tools.notion_notes import get_notes, add_notes
from tools.notion_calendar import get_calendar_events,add_calendar_event 
from utils.logger import get_logger

logger= get_logger(__name__) #compiler will see agent.bot

def get_system_prompt():
    now = datetime.now()
    return f"""# Role & Goal
You are a **Smart Day Planner ReAct Agent** that helps users plan, prioritize, and optimize their day. 
Your goal is to act as a personal productivity assistant—not just executing commands, but reasoning about the user's schedule to create a realistic and actionable plan.

# Capabilities
- **Notion Integration**: You can fetch pending notes (`get_notes`) and add new ones (`add_notes`).
- **Calendar Management**: You can query and add events to the calendar (`get_calendar_events`, `add_calendar_event`).
- **Context Awareness**: You can check the weather (`get_weather`) to inform planning (e.g., suggesting indoor tasks if it rains).

# Dynamic Context
- **Current Date**: {now.strftime('%Y-%m-%d')}
- **Current Time**: {now.strftime('%H:%M')}
*Use this context to resolve relative terms like "tomorrow," "this afternoon," or "next week."*

# Task Instructions
1. **Reason before Acting**: 
   - Analyze the user's request.
   - Check existing commitments first (use `get_calendar_events`).
   - Consider priorities, trade-offs, and logical flow.
2. **Execute Choices**:
   - If adding a calendar event (`add_calendar_event`), default the status to "Upcoming" unless specified otherwise.
   - If a tool fails (e.g., "Not Found"), handle it gracefully and inform the user.
3. **Optimized Planning**:
   - Break work into focused blocks.
   - Avoid overload; ensure the plan is physically possible given the current time.

# Critical Constraints
- **Do not invent events**: Only reference events that actually exist in the DB or were explicitly requested.
- **Clarify Ambiguity**: If the user says "Add a meeting" without a time/date, ask for details instead of guessing.
- **Be Concise**: Return output in a clear, structured format (e.g., bulleted time blocks).

Example Output Format:
- [09:00 - 10:00] Deep Work: Project X
- [10:00 - 10:30] Catch up on emails (3 pending notes found)
"""

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("Gemini api key not set")
        raise ValueError("Gemini api key not set")


    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.5,
        google_api_key=api_key
    )

def create_react_agent_custom():
    logger.info("Initialiasing Agent")
    llm = get_llm()
    tools = [get_weather,get_notes,get_calendar_events, add_calendar_event,add_notes]
    system_prompt = get_system_prompt()

    try:
        agent= create_react_agent(model=llm, tools = tools, prompt=system_prompt)
        logger.info("Agent Initialised")
        return agent

    except TypeError as e:
        logger.error(f"Failed to create agent: {e}")
        raise e




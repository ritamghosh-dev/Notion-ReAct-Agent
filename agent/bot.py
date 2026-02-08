import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from tools.weather import get_weather
from tools.notion_notes import get_notes, add_notes
from tools.notion_calendar import get_calendar_events,add_calendar_event 
from utils.logger import get_logger

logger= get_logger(__name__) #compiler will see agent.bot

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

    try:
        agent= create_agent(model=llm, tools = tools)
        logger.info("Agent Initialised")
        return agent

    except TypeError as e:
        logger.error(f"Failed to create agent: {e}")
        raise e




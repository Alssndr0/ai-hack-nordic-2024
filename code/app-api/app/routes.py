from fastapi import FastAPI, APIRouter
import logging
from fastapi import HTTPException
from pydantic import BaseModel
import openai
from openai import OpenAI
import os
import json
from . import graphql, init
from .system_messages import system_message
from .services.check_stop_flag import check_markdown_response

logger = logging.getLogger(__name__)

#### Routes ####

app = FastAPI()




@app.on_event("startup")
async def reinit():
    init.init()

app.include_router(graphql.get_app(), prefix="/api")


# Define the Conversation model
class Conversation(BaseModel):
    human: list[str]
    chatbot: list[str]

class ChatResponse(BaseModel):
    response: str
    stop_chat: bool = False  # Default to False

# Create an APIRouter instance for the chat route
# NOTE : ADD the OpenAI api key here
openai_key = os.getenv("OPENAI_API_KEY")

chat_router = APIRouter()
client = OpenAI(api_key= openai_key)


@chat_router.post("/chat", response_model=ChatResponse)
async def chat(conversation: Conversation):
    try:
        # Build the complete conversation history
        history = [{"role": "system", "content": system_message}]
        
        # Add the conversation history
        for human_message, chatbot_message in zip(conversation.human, conversation.chatbot):
            history.append({"role": "user", "content": human_message})
            history.append({"role": "assistant", "content": chatbot_message})

        # Add the new human message to the history
        latest_human_message = conversation.human[-1]

        history.append({"role": "user", "content": latest_human_message})

        # Call the OpenAI API with the user's message
        openai_response = client.beta.chat.completions.parse(
            model='gpt-4o-2024-08-06',
            messages=history
            
        )

        # Extract the response from OpenAI's API
        chatgpt_message = openai_response.choices[0].message.content
        #print(chatgpt_message)

        # Determine if the chatbot's response is a JSON-like structure
        stop_chat = check_markdown_response(chatgpt_message)
        # Return the response back to the chat interface
        return ChatResponse(response=chatgpt_message, stop_chat=stop_chat)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the chat router under the `/api` prefix
app.include_router(chat_router, prefix="/api")


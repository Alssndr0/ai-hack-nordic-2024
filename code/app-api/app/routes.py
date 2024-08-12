from fastapi import FastAPI, APIRouter
import logging
from fastapi import HTTPException
from pydantic import BaseModel
import openai
from openai import OpenAI
import os

from . import graphql, init

logger = logging.getLogger(__name__)

#### Routes ####

app = FastAPI()




@app.on_event("startup")
async def reinit():
    init.init()

app.include_router(graphql.get_app(), prefix="/api")


# Define the request and response models
class ChatRequest(BaseModel):
    history: str
    message: str

class ChatResponse(BaseModel):
    response: str


# Create an APIRouter instance for the chat route
openai_key = "sk-proj-Vt1YvJ7fjhgMAFuHOg9RT3BlbkFJHbhWrBgRySvLt62957lx"
chat_router = APIRouter()
client = OpenAI(api_key= openai_key)

# this is the instruction that is persistently passed to the model 
system = """You are a helpful assistant with the only role to help a human create a good schedule for their business. \n
     You role is to guide the human through the following points so that they can generate a good schedule, step by step, one question at the time: \n
     1. What is the business name?\n
     2. What type of business is it?\n
     3. Where is the business located? In case of multiple branches in the same city, please provide a unique location identifier, such as the neighborrhood or street.\n
     4. What days do you want the business to be opened?\n
     5. What times do you want the business to be opened?\n
     6. Specify all the roles that the business need to have covered in order to function well (e.g., cook, receptionist, waiter)?\n
     7. Once all the above information has been provieded, output all the parameters you have collected in a json format, without any additional text, so that they can be rendered from a front-end"""


@chat_router.post("/chat", response_model=ChatResponse)
async def chat(chat_request: ChatRequest):
    try:
        # Call the OpenAI API with the user's message
        openai_response = client.beta.chat.completions.parse(
            model='gpt-4o-2024-08-06',
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": f'{chat_request.history + chat_request.message}'},
            ]
        )

        # Extract the response from OpenAI's API
        chatgpt_message = openai_response.choices[0].message.content
        print(chatgpt_message)
        # Return the response back to the chat interface
        return ChatResponse(response=chatgpt_message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the chat router under the `/api` prefix
app.include_router(chat_router, prefix="/api")


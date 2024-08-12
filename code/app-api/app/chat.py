from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os

# Initialize the FastAPI app
app = FastAPI()

# Set your OpenAI API key
#openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = "sk-proj-Vt1YvJ7fjhgMAFuHOg9RT3BlbkFJHbhWrBgRySvLt62957lx"

# Define the request and response models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# Define the chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def get_chat_response(chat_request: ChatRequest):
    try:
        # Call the OpenAI API with the user's message
        openai_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": chat_request.message}
            ]
        )

        # Extract the response from OpenAI's API
        chatgpt_message = openai_response.choices[0].message['content']

        # Return the response back to the chat interface
        return ChatResponse(response=chatgpt_message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server using: uvicorn chat_interface:app --reload

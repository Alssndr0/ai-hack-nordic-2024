import strawberry
from pydantic import BaseModel, Field
from fastapi import HTTPException
import openai
from openai import OpenAI
import os
from typing import List
from ..auth import IsAuthenticated
# Import your chat_json_mapper functions
from ..chat_json_mapper import map_json_to_db #, create_business, create_location, create_location_role, create_location_opening_hours, create_role, create_staff_requirement, create_shift
import json

# Set up the OpenAI client
openai_key = os.getenv("OPENAI_API_KEY")  # Ensure you set your OpenAI API key here
client = OpenAI(api_key= openai_key)

# Define the input model for the GraphQL mutation

class SummaryInputModel(BaseModel):
    human: List[str]
    chatbot: List[str]
    summary: str

@strawberry.input
class SummaryInput:
    human: List[str]
    chatbot: List[str]
    summary: str
   


@strawberry.type
class Business(BaseModel):
    id: str = Field(..., description="Unique identifier for the business.")
    name: str = Field(..., description="Name of the business.")
    email: str = Field(..., description="Contact email of the business.")
    locationId: str = Field(..., description="Identifier for the primary location of the business.")

@strawberry.type
class Location(BaseModel):
    id: str = Field(..., description="Unique identifier for the location.")
    businessId: str = Field(..., description="Identifier for the business that owns the location.")
    name: str = Field(..., description="Name of the location.")
    address: str = Field(..., description="Physical address of the location.")
    email: str = Field(..., description="Contact email for the location.")

@strawberry.type
class LocationRole(BaseModel):
    id: str = Field(..., description="Unique identifier for the location role.")
    locationId: str = Field(..., description="Identifier for the location associated with the role.")
    roleId: str = Field(..., description="Identifier for the role within the location.")

@strawberry.type
class LocationOpeningHour(BaseModel):
    id: str = Field(..., description="Unique identifier for the location opening hour entry.")
    locationId: str = Field(..., description="Identifier for the location associated with the opening hours.")
    dayOfWeek: int = Field(..., description="Day of the week as an integer (1 for Monday, 7 for Sunday).")
    openTime: str = Field(..., description="Opening time of the location on the specified day.")
    closeTime: str = Field(..., description="Closing time of the location on the specified day.")

@strawberry.type
class Role(BaseModel):
    id: str = Field(..., description="Unique identifier for the role.")
    name: str = Field(..., description="Name of the role.")
    description: str = Field(..., description="Detailed description of the role.")

@strawberry.type
class StaffRequirement(BaseModel):
    id: str = Field(..., description="Unique identifier for the staff requirement.")
    shiftId: str = Field(..., description="Identifier for the shift associated with the staff requirement.")
    roleId: str = Field(..., description="Identifier for the role required for the shift.")
    employeesRequired: int = Field(..., description="Number of employees required for the role in the shift.")

@strawberry.type
class Shift(BaseModel):
    id: str = Field(..., description="Unique identifier for the shift.")
    shiftName: str = Field(..., description="Name or label for the shift.")
    locationId: str = Field(..., description="Identifier for the location where the shift takes place.")
    startTime: str = Field(..., description="Start time of the shift.")
    endTime: str = Field(..., description="End time of the shift.")
    date: str = Field(..., description="Date of the shift.")

@strawberry.type
class Input(BaseModel):
    business: Business
    locations: list[Location]
    locationRoles: list[LocationRole]
    locationOpeningHours: list[LocationOpeningHour]
    roles: list[Role]
    staffRequirements: list[StaffRequirement]
    shifts: list[Shift]

@strawberry.type
class BusinessSchedule(BaseModel):
    input: Input

# Define the GraphQL mutation using Strawberry
@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def convert_summary_to_json_and_populate_db(self, summary_input: SummaryInput) -> bool:
        try:
            # Prepare the prompt for ChatGPT to convert the summary to JSON
            scheduler_system = "You are a helpful assistant. Based on the provided information you will return a structured representation of all the given business attributes, along with a schedule where roles are assigned per each day and return it in a json format."
 
            history = [{"role": "system", "content": scheduler_system}]

            # Convert Strawberry input to Pydantic model
            input_data = SummaryInputModel(**summary_input.__dict__)
             # Add the conversation history
            for human_message, chatbot_message in zip(summary_input.human, summary_input.chatbot):
                history.append({"role": "user", "content": human_message})
                history.append({"role": "assistant", "content": chatbot_message})

            # Call the OpenAI API
            completion = client.beta.chat.completions.parse(
                    model="gpt-4o-2024-08-06",
                    messages= history,
                    response_format=BusinessSchedule,  
                )

            # Extract the JSON from the response
            json_response = completion.choices[0].message.content
            print(json_response)
            # Parse the JSON to ensure it's in the correct format
            try:
                parsed_json = json.loads(json_response)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail="Invalid JSON format received from GPT")

            # Populate the Couchbase collections with the parsed JSON data
            print(input_data)
            input_data = parsed_json.get("input", {})
            map_json_to_db(input_data)

            # Return a success message
            return True


        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


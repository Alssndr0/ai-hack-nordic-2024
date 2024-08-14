import strawberry
from pydantic import BaseModel, Field
from fastapi import HTTPException
import openai
from openai import OpenAI
import os
from typing import List
from ..auth import IsAuthenticated
import uuid
from .. import couchbase as cb, env
from ..chat_json_mapper import map_json_to_db #, create_business, create_location, create_location_role, create_location_opening_hours, create_role, create_staff_requirement, create_shift
import json
from .businesses import BusinessCreateInput as Business
from .locations import LocationCreateInput as Location
from .location_roles import LocationRoleCreateInput as LocationRole
from .location_opening_hours import LocationOpeningHoursCreateInput as LocationOpeningHours
from .roles import RoleCreateInput as Role
from .staff_requirements import StaffRequirementCreateInput as StaffRequirement
from .shifts import  ShiftCreateInput as Shift

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
class Input:
    business: Business
    locations: list[Location]
    locationRoles: list[LocationRole]
    locationOpeningHours: list[LocationOpeningHours]
    roles: list[Role]
    staffRequirements: list[StaffRequirement]
    shifts: list[Shift]

@strawberry.type
class BusinessSchedule(BaseModel):
    input: Input

@strawberry.type
class Response:
    status: bool
    id: str

@strawberry.scalar
class JSONScalar:
    serialize = json.dumps
    parse_value = json.loads

@strawberry.type
class BusinessInfo:
    id: str
    info: JSONScalar

def list_businesses_info():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT info, META().id FROM {env.get_couchbase_bucket()}._default.business_onboarding_info"
    )
    return [BusinessInfo(**r) for r in result]

@strawberry.type
class Query:
    @strawberry.field
    def businesses_onboarding_info(self) -> List[BusinessInfo]:
        return list_businesses_info()

    @strawberry.field
    def business_onboarding_info(self, id: str) -> BusinessInfo:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='business_onboarding_info', key=id)
        )
        return BusinessInfo(id=id, **result.content_as[dict])



# Define the GraphQL mutation using Strawberry
@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def convert_summary_to_json_and_populate_db(self, summary_input: SummaryInput) -> Response:
        try:
            # Prepare the prompt for ChatGPT to convert the summary to JSON
            scheduler_system = "You are a helpful assistant. Based on the provided information you will return a structured representation of all the given business attributes, along with a schedule where roles are assigned per each day and return it in a json format. Do not leave any attribute empty, remember to fill all the primary and foreign IDs."
 
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
            # print(json_response)
            
            # insert the busines json to db:
            key_id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                    cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                collection='business_onboarding_info',
                                key=key_id,
                                data={
                                    'info': json_response
                                }))

            # Parse the JSON to ensure it's in the correct format
            try:
                parsed_json = json.loads(json_response)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail="Invalid JSON format received from GPT")

            # Populate the Couchbase collections with the parsed JSON data
            # print('Input recieved!')
            input_data = parsed_json.get("input", {})
            await map_json_to_db(input_data)
  
            return Response(status=True, id=key_id)


        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))



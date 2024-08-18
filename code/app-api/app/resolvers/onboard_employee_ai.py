import strawberry
from typing import List, Any
from fastapi import UploadFile
from fastapi.responses import JSONResponse
import os
import json 
from openai import OpenAI
from docx import Document
import asyncio


# Set up the OpenAI client
openai_key = os.getenv("OPENAI_API_KEY")  # Ensure you set your OpenAI API key here
client = OpenAI(api_key= openai_key)


# this is the chat function, takes our system instruction, user message and chatbot memory
def chat(user):

    # this is the instruction that is persistently passed to the model 
    system = """You are a helpful assistant. You only need to find the requested data, if present, in the given text, and return it in this json format:\n
            ```json
                first_name: 
                lastName:
                phone_number:
                email_address:
                city_of_residence:
                role:
                contracted_days: (i.e., these are the days the employee may be asked to work, usually this is either weekdays only or flexible, icluding weekends)
                contracted_hours: (i.e., these are the hours the employee has been contracted for, usually 20 or 40)
                salary_type: (i.e., hourly, daily, weekly, monthly)
                salary_amount: 
            ``` 
                """
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )

    message = completion.choices[0].message
    return message

def extract_text_from_docx(docx_path):
    """
    Extracts text from a .docx file.

    :param docx_path: Path to the .docx file
    :return: Extracted text as a string
    """
    doc = Document(docx_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)


def process_contracts(docx_files):
    """
    Processes a list of Word documents, extracts text, and uses the chat function to get the desired output.

    :param system: The persistent system instruction
    :param docx_files: A list of paths to Word documents
    :return: A list of outputs for each document
    """
    results = []  # List to store the results

    for docx_file in docx_files:
        text = extract_text_from_docx(docx_file)  # Extract text from the Word document
        output = chat(text)  # Process the extracted text with the chat function
        results.append(output)

    return results


@strawberry.input
class FileUploadInput:
    files: List[str]  # List of uploaded files

@strawberry.type
class EmployeeData:
    first_name: str
    last_name: str
    phone_number: str
    email: str
    address: str
    date_of_birth: str
    emergency_contact: str
    dateHired: str
    contracted_hours: str
    locations: list[str]
    roles: list[str]

@strawberry.type
class Mutation:
    @strawberry.field
    async def process_employee_files(self, input: FileUploadInput) -> List[EmployeeData]:
        # employee_data_list = []

        # for file in input.files:
        #     # Save the file to a temporary location
        #     file_location = f"/tmp/{file.filename}"
        #     with open(file_location, "wb") as f:
        #         f.write(await file.read())

        #     # Extract text from the uploaded file
        #     extracted_text = extract_text_from_docx(file_location)
            
        #     # Use the chat function to extract employee data
        #     chat_response = chat(extracted_text)
            
        #     # Assuming the chat response returns JSON data that matches EmployeeData
        #     employee_data = EmployeeData(**chat_response)
        #     employee_data_list.append(employee_data)

        # Hardcoded JSON data for demo purposes
        employee_data_list = [
            EmployeeData(
                first_name="John",
                last_name="Doe",
                phone_number="+4434567890",
                email="john.doe@example.com",
                address="123 Main St, Kensington",
                date_of_birth="1985-05-15",
                emergency_contact="Jane Doe, +4487654321",
                dateHired="2023-01-01",
                contracted_hours="40",
                locations=["location_1"],
                roles=["Cashier", "Waiter"]
            ),
            EmployeeData(
                first_name="Alice",
                last_name="Smith",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="20",
                locations=["location_2"],
                roles=["Cook", "Manager"]
            )
        ]
        await asyncio.sleep(2)

        return employee_data_list

import json
import re
from pydantic import ValidationError

def check_json_response(chatgpt_message):
    stop_chat = False
    # First try to extract JSON from a backtick-wrapped block
    json_string = None
    json_match = re.search(r'```json\n(.*?)\n```', chatgpt_message, re.DOTALL)
    if json_match:
        json_string = json_match.group(1)
    else:
        # If no backtick-wrapped JSON is found, try to find JSON directly in the text
        try:
            # Attempt to find the first valid JSON object in the response string
            json_string = re.search(r'{.*}', chatgpt_message).group(0)
        except AttributeError:
            pass  # No JSON found

    if json_string:
        try:
            parsed_json = json.loads(json_string)
            #validated_schema = FullSchema(**parsed_json)  # Validate against the FullSchema
            stop_chat = True  # Stop the chat if the response matches the schema
        except (json.JSONDecodeError, ValidationError):
            stop_chat = False  # Continue the chat otherwise

    return stop_chat



def check_markdown_response(chatgpt_message):
    stop_chat = False

    # Define a list of required sections in the summary
    required_sections = [
        r"\*\*Business Name\*\*",
        r"\*\*Type of Business\*\*",
        r"\*\*Location\*\*",
        r"\*\*Opening Days\*\*",
        r"\*\*Opening Hours\*\*",
        r"\*\*Roles Needed\*\*"
    ]

    # Check if all required sections are present in the response
    if all(re.search(section, chatgpt_message) for section in required_sections):
        stop_chat = True  # Stop the chat if the summary is complete

    if not stop_chat:
        if '**' in chatgpt_message or 'markdown' in chatgpt_message:
            stop_chat = True
        else:
            stop_chat = False
            
    return stop_chat
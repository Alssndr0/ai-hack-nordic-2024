import strawberry
from typing import List

@strawberry.type
class Message:
    message: str

    
@strawberry.input
class EmployeeOnboardingInput:
    first_name: str
    last_name: str
    email: str
    address: str
    date_of_birth: str
    emergency_contact: str
    date_hired: str
    contracted_hours: str
    locations: List[str]  # List of location IDs where the employee will work
    roles: List[str]      # List of role IDs assigned to the employee

@strawberry.type
class OnboardEmployeeResponse:
    message: str
    employee_id: str


@strawberry.input
class EmployeeConstraintsInput:
    employee_id: str
    location_id: str
    is_available: bool
    date: str  # Standardized date format (e.g., "YYYY-MM-DD")
    day: int
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    details: str

@strawberry.type
class EmployeeConstraintsResponse:
    message: str
    employee_id: str
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


@strawberry.type
class CreateConstraintsResponse:
    message: str
    employee_id: str

@strawberry.input
class BusinessInput:
    id: str
    name: str
    email: str
    location_id: str

@strawberry.input
class LocationInput:
    id: str
    business_id: str
    name: str
    address: str
    email: str

@strawberry.input
class LocationRoleInput:
    id: str
    location_id: str
    role_id: str

@strawberry.input
class LocationOpeningHoursInput:
    id: str
    location_id: str
    day_of_week: int
    open_time: str
    close_time: str

@strawberry.input
class RoleInput:
    id: str
    name: str
    description: str

@strawberry.input
class StaffRequirementInput:
    id: str
    shift_id: str
    role_id: str
    employees_required: int

@strawberry.input
class ShiftInput:
    id: str
    shift_name: str
    location_id: str
    start_time: str
    end_time: str
    date: str

@strawberry.input
class JSONInput:
    business: List[BusinessInput]
    locations: List[LocationInput]
    location_roles: List[LocationRoleInput]
    location_opening_hours: List[LocationOpeningHoursInput]
    roles: List[RoleInput]
    staff_requirements: List[StaffRequirementInput]
    shifts: List[ShiftInput]
import strawberry
import strawberry
from typing import List
from .employees import Mutation as EmployeeMutation, EmployeeCreateInput
from .employee_locations import Mutation as EmployeeLocationMutation, EmployeeLocationCreateInput
from .employee_roles import Mutation as EmployeeRoleMutation, EmployeeRoleCreateInput
from ..types import EmployeeOnboardingInput, OnboardEmployeeResponse
from ..context import Info
import uuid
from .. import couchbase as cb, env

# Function to get role_id from role_name
def get_role_id(role_name: str) -> str:
    query = f"""
    SELECT id
    FROM `{env.get_couchbase_bucket()}`._default.roles
    WHERE LOWER(name) = LOWER('{role_name}')
    """
    result = cb.exec(env.get_couchbase_conf(), query)
    if result:
        print(result)
        return result[0]['id']
    else:
        raise ValueError(f"Role name '{role_name}' not found in roles table.")

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def onboard_employee(self, input: EmployeeOnboardingInput, info: Info) -> OnboardEmployeeResponse:
        # Insert employee details
        #employee_id = str(uuid.uuid4())
        employee_input = EmployeeCreateInput(
            employee_id=input.employee_id,
            first_name=input.first_name,
            last_name=input.last_name,
            email=input.email,
            address=input.address,
            date_of_birth=input.date_of_birth,
            emergency_contact=input.emergency_contact,
            date_hired= input.date_hired,
            contracted_hours= input.contracted_hours
            # roles=[],
            # locations=[]
        )
        await EmployeeMutation().employee_create([employee_input])

        # Insert employee locations
        employee_location_inputs = [
            EmployeeLocationCreateInput(employee_id=input.employee_id, location_id=location_id)
            for location_id in input.locations
        ]
        await EmployeeLocationMutation().employee_locations_create(employee_location_inputs)

        employee_role_inputs = []
        for role_name in input.roles:
            role_id = get_role_id(role_name)  # Get role_id from role_name
            employee_role_inputs.append(EmployeeRoleCreateInput(employee_id=input.employee_id, role_id=role_id))
        
        await EmployeeRoleMutation().employee_roles_create(employee_role_inputs)

        return OnboardEmployeeResponse(
            message=f"Employee {input.first_name + ' ' + input.last_name} onboarded successfully",
            employee_id=input.employee_id
        )

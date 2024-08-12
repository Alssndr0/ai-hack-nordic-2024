import json
import uuid
from .resolvers.businesses import Mutation as BusinessMutation
from .resolvers.employees import Mutation as EmployeeMutation
from .resolvers.locations import Mutation as LocationMutation
from .resolvers.location_opening_hours import Mutation as LocationOpeningHoursMutation
from .resolvers.shifts import Mutation as ShiftMutation
from .resolvers.roles import Mutation as RoleMutation
from .resolvers.staff_requirements import Mutation as StaffRequirementMutation
from .context import get_context

async def load_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

async def create_business(business_data):
    # Assuming you have a Mutation for creating business entities
    await BusinessMutation().businesses_create(businesses=business_data)

async def create_locations(locations_data):
    await LocationMutation().locations_create(locations=locations_data)

async def create_location_opening_hours(opening_hours_data):
    await LocationOpeningHoursMutation().location_opening_hours_create(opening_hours=opening_hours_data)

async def create_shifts(shifts_data):
    await ShiftMutation().shifts_create(shifts=shifts_data)

async def create_roles(roles_data):
    await RoleMutation().roles_create(roles=roles_data)

async def create_staff_requirements(staff_requirements_data):
    await StaffRequirementMutation().staff_requirements_create(staff_requirements=staff_requirements_data)

async def map_json_to_db(data):
    # data = await load_json(file_path)

    # Simulate a context for GraphQL Mutations
    context = await get_context()

    # Create Business (assuming the Mutation is implemented, otherwise skip or handle manually)
    if 'business' in data:
        await create_business(data.get('business'))

    # Create Locations
    if 'locations' in data:
        await create_locations(locations_data=[LocationMutation(**loc) for loc in data.get('locations', [])])

    # Create Location Opening Hours
    if 'location_opening_hours' in data:
        await create_location_opening_hours(opening_hours_data=[LocationOpeningHoursMutation(**loh) for loh in data.get('location_opening_hours', [])])

    # Create Shifts
    if 'shifts' in data:
        await create_shifts(shifts_data=[ShiftMutation(**shift) for shift in data.get('shifts', [])])

    # Create Roles
    if 'roles' in data:
        await create_roles(roles_data=[RoleMutation(**role) for role in data.get('roles', [])])

    # Create Staff Requirements
    if 'staff_requirements' in data:
        await create_staff_requirements(staff_requirements_data=[StaffRequirementMutation(**sr) for sr in data.get('staff_requirements', [])])

if __name__ == "__main__":
    import asyncio
    asyncio.run(map_json_to_db('data.json'))

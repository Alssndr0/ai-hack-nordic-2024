import strawberry
from ..types import JSONInput
from ..context import Info
from . import businesses, locations, location_roles, location_opening_hours, roles, staff_requirements, shifts

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def process_business_onboarding(self, input: JSONInput, info: Info) -> str:
        # Process the businesses
        await businesses.Mutation().businesses_create(input.business)
        
        # Process the locations
        await locations.Mutation().locations_create(input.locations)
        
        # Process the location roles
        await location_roles.Mutation().location_roles_create(input.location_roles)
        
        # Process the location opening hours
        await location_opening_hours.Mutation().location_opening_hours_create(input.location_opening_hours)
        
        # Process the roles
        await roles.Mutation().roles_create(input.roles)
        
        # Process the staff requirements
        await staff_requirements.Mutation().staff_requirements_create(input.staff_requirements)
        
        # Process the shifts
        await shifts.Mutation().shifts_create(input.shifts)

        return "Business onboarding processed successfully"

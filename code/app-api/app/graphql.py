import strawberry
from strawberry.tools import merge_types
from strawberry.fastapi import GraphQLRouter
import logging
import importlib
import pkgutil
from pathlib import Path

from . import auth, db
from .context import get_context

logger = logging.getLogger(__name__)

resolvers_path = Path(__file__).parent / "resolvers"

classes = {
    'Query': [],
    'Mutation': [], 
    'Subscription': [] 
}

for _, module_name, _ in pkgutil.iter_modules([resolvers_path]):
    module = importlib.import_module(f"app.resolvers.{module_name}")
    for attr_name in dir(module):
        attr = getattr(module, attr_name)
        if isinstance(attr, strawberry.types.types.Type) and attr_name in classes.keys():
            classes[attr_name].append(attr)

Query = merge_types("Query", tuple(classes['Query']))
Mutation = merge_types("Mutation", tuple(classes['Mutation']))
Subscription = merge_types("Subscription", tuple(classes['Subscription']))

def get_app():
    return GraphQLRouter(
        strawberry.Schema(Query, mutation=Mutation, subscription=Subscription),
        context_getter=get_context
    )
    

# import strawberry
# from strawberry.fastapi import GraphQLRouter
# import logging

# from . import auth, db
# from .context import get_context
# from app_api.resolver.employees import Query as EmployeeQuery, Mutation as EmployeeMutation, Subscription as EmployeeSubscription
# from app_api.resolver.locations import Query as LocationQuery, Mutation as LocationMutation, Subscription as LocationSubscription
# from app_api.resolver.roles import Query as RoleQuery, Mutation as RoleMutation, Subscription as RoleSubscription
# from app_api.resolver.shifts import Query as ShiftQuery, Mutation as ShiftMutation, Subscription as ShiftSubscription
# from app_api.resolver.staff_requirements import Query as StaffRequirementQuery, Mutation as StaffRequirementMutation, Subscription as StaffRequirementSubscription
# from app_api.resolver.schedules import Query as ScheduleQuery, Mutation as ScheduleMutation, Subscription as ScheduleSubscription
# from app_api.resolver.constraints import Query as ConstraintQuery, Mutation as ConstraintMutation, Subscription as ConstraintSubscription
# from app_api.resolver.location_roles import Query as LocationRoleQuery, Mutation as LocationRoleMutation, Subscription as LocationRoleSubscription
# from app_api.resolver.mutations import OnboardingMutation

# logger = logging.getLogger(__name__)

# # Explicitly combine all Query classes
# @strawberry.type
# class Query(
#     EmployeeQuery,
#     LocationQuery,
#     RoleQuery,
#     ShiftQuery,
#     StaffRequirementQuery,
#     ScheduleQuery,
#     ConstraintQuery,
#     LocationRoleQuery
# ):
#     pass

# # Explicitly combine all Mutation classes
# @strawberry.type
# class Mutation(
#     EmployeeMutation,
#     LocationMutation,
#     RoleMutation,
#     ShiftMutation,
#     StaffRequirementMutation,
#     ScheduleMutation,
#     ConstraintMutation,
#     LocationRoleMutation,
#     OnboardingMutation  

# ):
#     pass

# # Explicitly combine all Subscription classes
# @strawberry.type
# class Subscription(
#     EmployeeSubscription,
#     LocationSubscription,
#     RoleSubscription,
#     ShiftSubscription,
#     StaffRequirementSubscription,
#     ScheduleSubscription,
#     ConstraintSubscription,
#     LocationRoleSubscription
# ):
#     pass

# def get_app():
#     return GraphQLRouter(
#         schema=strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription),
#         context_getter=get_context
#     )

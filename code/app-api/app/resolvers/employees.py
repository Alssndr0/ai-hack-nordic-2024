import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_of_all_employees():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT employee_id, first_name, last_name, email, address, date_of_birth, emergency_contact, date_hired, contracted_hours, META().id FROM {env.get_couchbase_bucket()}._default.employees"
    )
    return [Employee(**r) for r in result]

def employee_info_by_id(id: str):
    result = cb.get(
    env.get_couchbase_conf(),
    cb.DocRef(bucket=env.get_couchbase_bucket(), collection = 'employees', key=id)
    )

    return Employee(id=id, **result.content_as[dict])




@strawberry.type
class Employee:
    id: str
    employee_id: str
    first_name: str 
    last_name: str 
    email: str
    address: str
    date_of_birth: str
    emergency_contact: str
    date_hired: str
    contracted_hours: str


@strawberry.input
class EmployeeCreateInput:
#    id: str
    employee_id: str
    first_name: str 
    last_name: str 
    email: str
    address: str
    date_of_birth: str
    emergency_contact: str
    date_hired: str
    contracted_hours: str


@strawberry.type
class Query:
    @strawberry.field
    def employees(self) -> List[Employee]:
        '''Returns a list of all employees.'''
        return list_of_all_employees()


    @strawberry.field
    def employee(self, id: str) -> Employee:
        '''Returns a single employee based on the provided ID.'''
        return employee_info_by_id(id)
    


@strawberry.type
class Mutation:

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def employee_create(self, employees: List[EmployeeCreateInput]) -> List[Employee]:
        '''Creates new employees based on the provided input and returns the created employees.'''

        created_employees = []
        for employee in employees:
            id = str(uuid.uuid1())
            cb.insert(
                env.get_couchbase_conf(),
                cb.DocSpec(
                    bucket = env.get_couchbase_bucket(),
                    collection = 'employees',
                    key = id,
                    data = {
                        'employee_id' : employee.employee_id,
                        'first_name' : employee.first_name,
                        'last_name' : employee.last_name,
                        'email' : employee.email,
                        'address' : employee.address,
                        'date_of_birth' : employee.date_of_birth,
                        'emergency_contact' : employee.emergency_contact,
                        'date_hired' : employee.date_hired,
                        'contracted_hours' : employee.contracted_hours
                    }
                )
            )

            created_employee = Employee(
                id = id,
                employee_id = employee.employee_id,
                first_name = employee.first_name,
                last_name = employee,
                email = employee.email,
                address = employee.address,
                date_of_birth = employee.date_of_birth,
                emergency_contact = employee.emergency_contact,
                date_hired = employee.date_hired,
                contracted_hours = employee.contracted_hours
            )

            created_employees.append(created_employee)

            return created_employees

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def employee_remove(self, ids: list[str]) -> List[str]:
        '''Removes employees based on the provided IDs and returns the removed IDs.'''

        for id in ids:
            cb.remove(
                env.get_couchbase_conf(),
                cb.DocRef(
                    bucket = env.get_couchbase_bucket(),
                    collection = 'employees',
                    key = id
                )
            )

        return ids


@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def employee_created(self, info: strawberry.types.info) -> AsyncGenerator[Employee, None]:
        seen = set(p.id for p in list_of_all_employees())
        while True:
            current_time = int(time.time())
            for p in list_of_all_employees():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p

            await asyncio.sleep(0.5)


# # finally defining the schema:
# schema = strawberry.schema(query = Query, mutation = Mutation, subscription = Subscription)


# from fastapi import FastAPI
# from strawberry.fastapi import GraphQLRouter

# app = FastAPI()

# graphql_app = GraphQLRouter(schema)

# app.include_router(graphql_app, prefix="/graphql")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)






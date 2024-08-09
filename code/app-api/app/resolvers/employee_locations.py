import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_employee_locations():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT employee_id, location_id, META().id FROM {env.get_couchbase_bucket()}._default.employee_locations"
    )
    return [EmployeeLocation(**r) for r in result]

@strawberry.type
class EmployeeLocation:
    id: str
    employee_id: str
    location_id: str

@strawberry.input
class EmployeeLocationCreateInput:
    employee_id: str
    location_id: str

@strawberry.type
class Query:
    @strawberry.field
    def employee_locations(self) -> List[EmployeeLocation]:
        return list_employee_locations()

    @strawberry.field
    def employee_location(self, id: str) -> EmployeeLocation:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='employee_locations', key=id)
        )
        return EmployeeLocation(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def employee_locations_create(self, employee_locations: List[EmployeeLocationCreateInput]) -> List[EmployeeLocation]:
        created_employee_locations = []
        for employee_location in employee_locations:
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='employee_locations',
                                 key=id,
                                 data={
                                     'employee_id': employee_location.employee_id,
                                     'location_id': employee_location.location_id
                                 }))
            created_employee_location = EmployeeLocation(
                id=id,
                employee_id=employee_location.employee_id,
                location_id=employee_location.location_id
            )
            created_employee_locations.append(created_employee_location)
        return created_employee_locations

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def employee_locations_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='employee_locations',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def employee_locations_created(self, info: strawberry.types.Info) -> AsyncGenerator[EmployeeLocation, None]:
        seen = set(p.id for p in list_employee_locations())
        while True:
            current_time = int(time.time())
            for p in list_employee_locations():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated
from ..types import CreateConstraintsResponse

logger = logging.getLogger(__name__)

def list_constraints():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT employee_id, location_id, is_available, date, day, start_time, end_time, details, META().id FROM {env.get_couchbase_bucket()}._default.constraints"
    )
    return [Constraint(**r) for r in result]

@strawberry.type
class Constraint:
    id: str
    employee_id: str
    location_id: str
    is_available: bool
    date: str
    day: int
    start_time: str
    end_time: str
    details: str

@strawberry.input
class ConstraintCreateInput:
    employee_id: str
    location_id: str
    is_available: bool
    date: str
    day: int
    start_time: str
    end_time: str
    details: str

@strawberry.type
class Query:
    @strawberry.field
    def constraints(self) -> List[Constraint]:
        return list_constraints()

    @strawberry.field
    def constraint(self, id: str) -> Constraint:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='constraints', key=id)
        )
        return Constraint(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def constraints_create(self, constraints: List[ConstraintCreateInput]) -> List[Constraint]:
        created_constraints = []
        for constraint in constraints:
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='constraints',
                                 key=id,
                                 data={
                                     'employee_id': constraint.employee_id,
                                     'location_id': constraint.location_id,
                                     'is_available': constraint.is_available,
                                     'date': constraint.date,
                                     'day': constraint.day,
                                     'start_time': constraint.start_time,
                                     'end_time': constraint.end_time,
                                     'details': constraint.details
                                 }))
            created_constraint = Constraint(
                id=id,
                employee_id=constraint.employee_id,
                location_id=constraint.location_id,
                is_available=constraint.is_available,
                date=constraint.date,
                day=constraint.day,
                start_time=constraint.start_time,
                end_time=constraint.end_time,
                details=constraint.details
            )
            created_constraints.append(created_constraint)
        return created_constraints
        # return CreateConstraintsResponse(
        #     message=f"Constraints created succesfully for employee id {constraint.employee_id}",
        #     employee_id=constraint.employee_id
        # )

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def constraints_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='constraints',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def constraints_created(self, info: strawberry.types.Info) -> AsyncGenerator[Constraint, None]:
        seen = set(p.id for p in list_constraints())
        while True:
            current_time = int(time.time())
            for p in list_constraints():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_staff_requirements():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT shift_id, role_id, employees_required, META().id FROM {env.get_couchbase_bucket()}._default.staff_requirements"
    )
    return [StaffRequirement(**r) for r in result]

@strawberry.type
class StaffRequirement:
    id: str
    shift_id: str
    role_id: str
    employees_required: int

@strawberry.input
class StaffRequirementCreateInput:
    id: str
    shift_id: str
    role_id: str
    employees_required: int

@strawberry.type
class Query:
    @strawberry.field
    def staff_requirements(self) -> List[StaffRequirement]:
        return list_staff_requirements()

    @strawberry.field
    def staff_requirement(self, id: str) -> StaffRequirement:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='staff_requirements', key=id)
        )
        return StaffRequirement(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def staff_requirements_create(self, staff_requirements: List[StaffRequirementCreateInput]) -> List[StaffRequirement]:
        created_staff_requirements = []
        for requirement in staff_requirements:
            key_id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='staff_requirements',
                                 key=key_id,
                                 data={
                                    'id': requirement['id'],
                                     'shift_id': requirement['shift_id'],
                                     'role_id': requirement['role_id'],
                                     'employees_required': requirement['employees_required']
                                 }))
            created_staff_requirement = StaffRequirement(
                id=id,
                shift_id=requirement.shift_id,
                role_id=requirement.role_id,
                employees_required=requirement.employees_required
            )
            created_staff_requirements.append(created_staff_requirement)
        return created_staff_requirements

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def staff_requirements_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='staff_requirements',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def staff_requirements_created(self, info: strawberry.types.Info) -> AsyncGenerator[StaffRequirement, None]:
        seen = set(p.id for p in list_staff_requirements())
        while True:
            current_time = int(time.time())
            for p in list_staff_requirements():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_employee_roles():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT employee_id, role_id, META().id FROM {env.get_couchbase_bucket()}._default.employee_roles"
    )
    return [EmployeeRole(**r) for r in result]

@strawberry.type
class EmployeeRole:
    id: str
    employee_id: str
    role_id: str

@strawberry.input
class EmployeeRoleCreateInput:
    #id: str
    employee_id: str
    role_id: str

@strawberry.type
class Query:
    @strawberry.field
    def employee_roles(self) -> List[EmployeeRole]:
        return list_employee_roles()

    @strawberry.field
    def employee_role(self, id: str) -> EmployeeRole:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='employee_roles', key=id)
        )
        return EmployeeRole(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def employee_roles_create(self, employee_roles: List[EmployeeRoleCreateInput]) -> List[EmployeeRole]:
        created_employee_roles = []
        for employee_role in employee_roles:
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='employee_roles',
                                 key=id,
                                 data={
                                     'employee_id': employee_role.employee_id,
                                     'role_id': employee_role.role_id
                                 }))
            created_employee_role = EmployeeRole(
                id=id,
                employee_id=employee_role.employee_id,
                role_id=employee_role.role_id
            )
            created_employee_roles.append(created_employee_role)
        return created_employee_roles

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def employee_roles_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='employee_roles',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def employee_roles_created(self, info: strawberry.types.Info) -> AsyncGenerator[EmployeeRole, None]:
        seen = set(p.id for p in list_employee_roles())
        while True:
            current_time = int(time.time())
            for p in list_employee_roles():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

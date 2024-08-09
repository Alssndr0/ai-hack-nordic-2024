import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_roles():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT name, description, META().id FROM {env.get_couchbase_bucket()}._default.roles"
    )
    return [Role(**r) for r in result]

@strawberry.type
class Role:
    id: str
    name: str
    description: str

@strawberry.input
class RoleCreateInput:
    name: str
    description: str

@strawberry.type
class Query:
    @strawberry.field
    def roles(self) -> List[Role]:
        return list_roles()

    @strawberry.field
    def role(self, id: str) -> Role:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='roles', key=id)
        )
        return Role(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def roles_create(self, roles: List[RoleCreateInput]) -> List[Role]:
        created_roles = []
        for role in roles:
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='roles',
                                 key=id,
                                 data={
                                     'name': role.name,
                                     'description': role.description
                                 }))
            created_role = Role(
                id=id,
                name=role.name,
                description=role.description
            )
            created_roles.append(created_role)
        return created_roles

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def roles_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='roles',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def roles_created(self, info: strawberry.types.Info) -> AsyncGenerator[Role, None]:
        seen = set(p.id for p in list_roles())
        while True:
            current_time = int(time.time())
            for p in list_roles():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

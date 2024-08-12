import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_location_roles():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT location_id, role_id, META().id FROM {env.get_couchbase_bucket()}._default.location_roles"
    )
    return [LocationRole(**r) for r in result]

@strawberry.type
class LocationRole:
    id: str
    location_id: str
    role_id: str

@strawberry.input
class LocationRoleCreateInput:
    id: str
    location_id: str
    role_id: str

@strawberry.type
class Query:
    @strawberry.field
    def location_roles(self) -> List[LocationRole]:
        return list_location_roles()

    @strawberry.field
    def location_role(self, id: str) -> LocationRole:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='location_roles', key=id)
        )
        return LocationRole(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def location_roles_create(self, location_roles: List[LocationRoleCreateInput]) -> List[LocationRole]:
        created_location_roles = []
        for location_role in location_roles:
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='location_roles',
                                 key=id,
                                 data={
                                     'location_id': location_role.location_id,
                                     'role_id': location_role.role_id
                                 }))
            created_location_role = LocationRole(
                id=id,
                location_id=location_role.location_id,
                role_id=location_role.role_id
            )
            created_location_roles.append(created_location_role)
        return created_location_roles

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def location_roles_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='location_roles',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def location_roles_created(self, info: strawberry.types.Info) -> AsyncGenerator[LocationRole, None]:
        seen = set(p.id for p in list_location_roles())
        while True:
            current_time = int(time.time())
            for p in list_location_roles():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

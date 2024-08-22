import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_locations():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT business_id, name, address, email, META().id FROM {env.get_couchbase_bucket()}._default.locations"
    )
    return [Location(**r) for r in result]

@strawberry.type
class Location:
    id: str
    business_id: str
    name: str
    address: str
    email: str

@strawberry.input
class LocationCreateInput:
    id: str
    business_id: str
    name: str
    address: str
    email: str

@strawberry.type
class Query:
    @strawberry.field
    def locations(self) -> List[Location]:
        return list_locations()

    @strawberry.field
    def location(self, id: str) -> Location:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='locations', key=id)
        )
        return Location(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def locations_create(self, locations: List[LocationCreateInput]) -> bool:
        created_locations = []
        for location in locations:
            key_id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='locations',
                                 key = key_id,
                                 data={
                                     'id': location['id'],
                                     'business_id': location['business_id'],
                                     'name': location['name'],
                                     'address': location['address'],
                                     'email': location['email']
                                 }))
        return True

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def locations_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='locations',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def locations_created(self, info: strawberry.types.Info) -> AsyncGenerator[Location, None]:
        seen = set(p.id for p in list_locations())
        while True:
            current_time = int(time.time())
            for p in list_locations():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

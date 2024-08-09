import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_businesses():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT location_id, name, email, META().id FROM {env.get_couchbase_bucket()}._default.businesses"
    )
    return [Business(**r) for r in result]

@strawberry.type
class Business:
    id: str
    location_id: str
    name: str
    email: str

@strawberry.input
class BusinessCreateInput:
    location_id: str
    name: str
    email: str

@strawberry.type
class Query:
    @strawberry.field
    def businesses(self) -> List[Business]:
        return list_businesses()

    @strawberry.field
    def business(self, id: str) -> Business:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='businesses', key=id)
        )
        return Business(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def businesses_create(self, businesses: List[BusinessCreateInput]) -> List[Business]:
        created_businesses = []
        for business in businesses:
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='businesses',
                                 key=id,
                                 data={
                                     'location_id': business.location_id,
                                     'name': business.name,
                                     'email': business.email
                                 }))
            created_business = Business(
                id=id,
                location_id=business.location_id,
                name=business.name,
                email=business.email
            )
            created_businesses.append(created_business)
        return created_businesses

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def businesses_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='businesses',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def businesses_created(self, info: strawberry.types.Info) -> AsyncGenerator[Business, None]:
        seen = set(p.id for p in list_businesses())
        while True:
            current_time = int(time.time())
            for p in list_businesses():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

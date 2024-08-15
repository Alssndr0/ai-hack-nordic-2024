import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_location_opening_hours():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT location_id, day_of_week, open_time, close_time, META().id FROM {env.get_couchbase_bucket()}._default.location_opening_hours"
    )
    return [LocationOpeningHours(**r) for r in result]

@strawberry.type
class LocationOpeningHours:
    id: str
    location_id: str
    day_of_week: int
    open_time: str
    close_time: str

@strawberry.input
class LocationOpeningHoursCreateInput:
    id: str
    location_id: str
    day_of_week: int
    open_time: str
    close_time: str

@strawberry.type
class Query:
    @strawberry.field
    def location_opening_hours(self) -> List[LocationOpeningHours]:
        return list_location_opening_hours()

    @strawberry.field
    def location_opening_hour(self, id: str) -> LocationOpeningHours:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='location_opening_hours', key=id)
        )
        return LocationOpeningHours(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def location_opening_hours_create(self, opening_hours: List[LocationOpeningHoursCreateInput]) -> List[LocationOpeningHours]:
        created_opening_hours = []
        for hour in opening_hours:
            key_id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='location_opening_hours',
                                 key=key_id,
                                 data={
                                    'id': hour['id'],
                                     'location_id': hour['location_id'],
                                     'day_of_week': hour['day_of_week'],
                                     'open_time': hour['open_time'],
                                     'close_time': hour['close_time']
                                 }))
            # created_hour = LocationOpeningHours(
            #     id=hour['id'],
            #     location_id=hour['location_id'],
            #     day_of_week=hour['day_of_week'],
            #     open_time=hour['open_time'],
            #     close_time=hour['close_time']
            # )
            # created_opening_hours.append(created_hour)
        return True

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def location_opening_hours_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='location_opening_hours',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def location_opening_hours_created(self, info: strawberry.types.Info) -> AsyncGenerator[LocationOpeningHours, None]:
        seen = set(p.id for p in list_location_opening_hours())
        while True:
            current_time = int(time.time())
            for p in list_location_opening_hours():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

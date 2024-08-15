import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated

logger = logging.getLogger(__name__)

def list_shifts():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT shift_id, shift_name, location_id, start_time, end_time, date, META().id FROM {env.get_couchbase_bucket()}._default.shifts"
    )
    return [Shift(**r) for r in result]

@strawberry.type
class Shift:
    id: str
    shift_id: str
    shift_name: str
    location_id: str
    start_time: str
    end_time: str
    date: str

@strawberry.input
class ShiftCreateInput:
    id : str
    shift_id: str
    shift_name: str
    location_id: str
    start_time: str
    end_time: str
    date: str

@strawberry.type
class Query:
    @strawberry.field
    def shifts(self) -> List[Shift]:
        return list_shifts()

    @strawberry.field
    def shift(self, id: str) -> Shift:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='shifts', key=id)
        )
        return Shift(id=id, **result.content_as[dict])

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def shifts_create(self, shifts: List[ShiftCreateInput]) -> List[Shift]:
        created_shifts = []
        for shift in shifts:
            key_id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='shifts',
                                 key=key_id,
                                 data={
                                    'shift_id': shift['id'],
                                     'shift_name': shift['shift_name'],
                                     'location_id': shift['location_id'],
                                     'start_time': shift['start_time'],
                                     'end_time': shift['end_time'],
                                     'date': shift['date']
                                 }))
            # created_shift = Shift(
            #     id=id,
            #     shift_name=shift.shift_name,
            #     location_id=shift.location_id,
            #     start_time=shift.start_time,
            #     end_time=shift.end_time,
            #     date=shift.date
            # )
            # created_shifts.append(created_shift)
        return True

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def shifts_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='shifts',
                                key=id))
        return ids

@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def shifts_created(self, info: strawberry.types.Info) -> AsyncGenerator[Shift, None]:
        seen = set(p.id for p in list_shifts())
        while True:
            current_time = int(time.time())
            for p in list_shifts():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

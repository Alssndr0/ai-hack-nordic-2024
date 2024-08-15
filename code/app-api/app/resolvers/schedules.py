import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from .. import couchbase as cb, env
from ..auth import IsAuthenticated
from .employees import list_of_all_employees
from .employee_roles import list_employee_roles
from .constraints import list_constraints
from .staff_requirements import list_staff_requirements
from .shifts import list_shifts
from ..scheduler import assign_roles_by_shift
from ..types import ScheduleCreateInput

logger = logging.getLogger(__name__)
 
 
def list_schedules():
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT employee_id, role_id, shift_id, META().id FROM {env.get_couchbase_bucket()}._default.schedules"
    )
    return [Schedule(**r) for r in result]
 
@strawberry.type
class Schedule:
    id: str
    employee_id: str
    role_id: str
    shift_id: str
 

@strawberry.type
class Query:
    @strawberry.field
    def schedules(self) -> List[Schedule]:
        return list_schedules()
 
    @strawberry.field
    def schedule(self, id: str) -> Schedule:
        result = cb.get(
            env.get_couchbase_conf(),
            cb.DocRef(bucket=env.get_couchbase_bucket(), collection='schedules', key=id)
        )
        return Schedule(id=id, **result.content_as[dict])
 
@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def schedules_create(self) -> List[Schedule]:
        shifts = list_shifts()
        staff_requirements = list_staff_requirements()
        employees = list_of_all_employees()
        
        constraints = list_constraints()
        employee_roles = list_employee_roles()
        schedules = assign_roles_by_shift(shifts, staff_requirements, employees, constraints, employee_roles)
        created_schedules = []
        print('outside the schedule loop!')
        print(schedules)
        for schedule in schedules:
            
            id = str(uuid.uuid1())
            cb.insert(env.get_couchbase_conf(),
                      cb.DocSpec(bucket=env.get_couchbase_bucket(),
                                 collection='schedules',
                                 key=id,
                                 data={
                                     'employee_id': schedule.employee_id,
                                     'role_id': schedule.role_id,
                                     'shift_id': schedule.shift_id
                                 }))
            created_schedule = Schedule(
                id=id,
                employee_id=schedule.employee_id,
                role_id=schedule.role_id,
                shift_id=schedule.shift_id
            )
            created_schedules.append(created_schedule)
        return created_schedules
 
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def schedules_remove(self, ids: List[str]) -> List[str]:
        for id in ids:
            cb.remove(env.get_couchbase_conf(),
                      cb.DocRef(bucket=env.get_couchbase_bucket(),
                                collection='schedules',
                                key=id))
        return ids
 
@strawberry.type
class Subscription:
    @strawberry.subscription(permission_classes=[IsAuthenticated])
    async def schedules_created(self, info: strawberry.types.Info) -> AsyncGenerator[Schedule, None]:
        seen = set(p.id for p in list_schedules())
        while True:
            current_time = int(time.time())
            for p in list_schedules():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)
 
# Define the schema
schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)
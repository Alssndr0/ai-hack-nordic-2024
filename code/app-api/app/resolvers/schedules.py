import asyncio
import time
from typing import AsyncGenerator, List
import strawberry
import uuid
import logging
from datetime import date
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

def get_schedules(year=2024, week=1):
    # Calculate the start and end dates of the specified ISO week
    start_date = date.fromisocalendar(year, week, 1)  # Monday of the ISO week
    end_date = date.fromisocalendar(year, week, 7)    # Sunday of the ISO week

    query = f"""
    SELECT e.first_name, e.last_name, sh.date, sh.shift_name, sh.start_time, sh.end_time, ro.name AS role_name
    FROM {env.get_couchbase_bucket()}._default.employees AS e
    JOIN {env.get_couchbase_bucket()}._default.schedules AS sc ON e.employee_id = sc.employee_id
    JOIN {env.get_couchbase_bucket()}._default.shifts AS sh ON sc.shift_id = sh.shift_id
    JOIN {env.get_couchbase_bucket()}._default.roles AS ro ON sc.role_id = ro.id
    WHERE sh.date BETWEEN '{start_date}' AND '{end_date}'
    """
    result = cb.exec(
        env.get_couchbase_conf(),
        query
    )
    return result

def get_schedule_template():
    # Get the Couchbase bucket name from the environment configuration
    bucket_name = env.get_couchbase_bucket()
 
    # Define the Couchbase N1QL query using the dynamic bucket name
    query = f"""
    SELECT sh.shift_id, loh.day_of_week, loh.open_time, loh.close_time,
           sh.shift_name, sh.start_time, sh.end_time, 
           r.name AS role_name, sr.employees_required, loh.location_id, loc.name AS location_name
    FROM {bucket_name}._default.location_opening_hours AS loh
    JOIN {bucket_name}._default.shifts AS sh ON loh.location_id = sh.location_id
    JOIN {bucket_name}._default.staff_requirements AS sr ON sh.shift_id = sr.shift_id
    JOIN {bucket_name}._default.roles AS r ON sr.role_id = r.id
    JOIN {bucket_name}._default.locations AS loc ON loh.location_id = loc.id
    """
 
    # Execute the query against the Couchbase database
    result = cb.exec(
        env.get_couchbase_conf(),
        query
    )
    return result
 
@strawberry.type
class Schedule:
    id: str
    employee_id: str
    role_id: str
    shift_id: str
 

@strawberry.type
class ScheduleWeek:
    first_name: str
    last_name: str
    date: str
    shift_name: str
    start_time: str
    end_time: str
    role_name: str

@strawberry.type
class ScheduleTemplate:
    shift_id: str
    day_of_week: str
    open_time: str
    close_time: str
    shift_name: str
    start_time: str
    end_time: str
    role_name: str
    employees_required: str
    location_id: str
    location_name: str

    




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

    @strawberry.field
    def get_schedules_by_week(self, year: int = 2024, week: int = 1) -> List[ScheduleWeek]:
        results = get_schedules(year, week)
        #print('HERE : ', results)
        return [ScheduleWeek(**r) for r in results]

    @strawberry.field
    def schedule_template(self,) -> List[ScheduleTemplate]:
        results = get_schedule_template()
        #print('HERE : ', results)
        return [ScheduleTemplate(**r) for r in results]
 
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
        #print('outside the schedule loop!')
        #print(schedules)
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
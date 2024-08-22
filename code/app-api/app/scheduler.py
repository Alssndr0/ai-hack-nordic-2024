from .types import ScheduleCreateInput
from datetime import datetime, timedelta

def assign_roles_by_shift(shifts, staff_requirements, employees, constraints, employee_roles) -> list:
    schedule_by_shift_id = {}
   
    # Create a dictionary to keep track of assigned hours for each employee
    employee_assigned_hours = {emp.employee_id : 0 for emp in employees}
   
    # Create a dictionary to track how many shifts an employee is assigned per day
    employee_daily_shifts = {emp.employee_id: {} for emp in employees}
    print(f"Employee daily shifts: {employee_daily_shifts}")

    for shift in shifts:
        #print(shift_id)
        shift_id = shift.sid
        shift_type_id = shift.shift_id
        shift_time = shift.shift_name  # Morning or Evening
        shift_date = shift.date

        # Adjust the shift_end time if it is '24:00' to '00:00' and move to the next day
        shift_start = shift.start_time
        shift_end = shift.end_time
 
        if not any([(shift_type_id == staff_requirement.shift_id) for staff_requirement in staff_requirements]):
            print(f"No staff requirements for shift_id: {shift_id}, skipping")
            continue
 
        if shift_id not in schedule_by_shift_id:
            schedule_by_shift_id[shift_id] = {
                "roles": {}
            }
 
        roles_required = [
        {
            "role_id": entry.role_id,
            "employees_required": entry.employees_required
        }
        for entry in staff_requirements
        if entry.shift_id == shift_type_id
        ]

        shift_start = shift.start_time
        shift_end = shift.end_time
        shift_duration = (datetime.strptime(shift_end, "%H:%M") - datetime.strptime(shift_start, "%H:%M")).seconds // 3600

       
        for role_required in roles_required:
            role = role_required['role_id']
            employees_required = role_required['employees_required']
            if role not in schedule_by_shift_id[shift_id]["roles"]:
                schedule_by_shift_id[shift_id]["roles"][role] = []
 
            # Filter employees by role
            eligible_employees = [
                e for e in employees
                if any(er.employee_id == e.employee_id and er.role_id == role for er in employee_roles)
            ]

            # Sort employees by remaining contracted hours (descending)
            eligible_employees.sort(key=lambda x: int(x.contracted_hours) - employee_assigned_hours[x.employee_id], reverse=True)
 
            for _ in range(int(employees_required)):
                for employee in eligible_employees:
                    emp_id = employee.employee_id
 
                    # Initialize the shift count for the employee on this date if not already initialized
                    if shift_date not in employee_daily_shifts[emp_id]:
                        employee_daily_shifts[emp_id][shift_date] = 0
 
                    if (
                        next((not c.is_available for c in constraints if c.employee_id == emp_id and c.shift_id == shift_type_id), True) and
                        int(employee.contracted_hours) - employee_assigned_hours[emp_id] >= shift_duration and
                        employee_daily_shifts[emp_id][shift_date] < 1 and
                        emp_id not in schedule_by_shift_id[shift_id]["roles"][role]
                    ):
                        # Assign the employee to the role in this shift
                        schedule_by_shift_id[shift_id]["roles"][role].append(emp_id)
                        employee_assigned_hours[emp_id] += shift_duration
                        employee_daily_shifts[emp_id][shift_date] += 1
                        #print(f"Assigned employee {emp_id} to role {role} in shift {shift_id}")

                        break
                else:
                    # If no eligible employee found, leave this slot empty
                    schedule_by_shift_id[shift_id]["roles"][role].append(None)

    # Convert the nested structure to a flat structure
    flat_schedule = []
    print('schedule_by_shift_id : ', schedule_by_shift_id)
    for shift_id, shift_info in schedule_by_shift_id.items():
        for role_id, employees in shift_info["roles"].items():
            for emp_id in employees:
                if emp_id is not None:
                    schedulecreateinput = ScheduleCreateInput(
                        employee_id= emp_id,
                        shift_id= shift_id,
                        role_id= role_id
                    )
                    flat_schedule.append(schedulecreateinput)
    print('Flat Schedule : ', flat_schedule)
    return flat_schedule
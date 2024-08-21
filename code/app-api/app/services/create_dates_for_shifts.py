from datetime import datetime, timedelta
from ..resolvers.shifts import ShiftCreateInput 

def generate_shifts_for_current_week(shift_templates: list) -> list:
    """
    Generate shifts for the current week based on the provided shift templates.

    :param shift_templates: A list of dictionaries, each representing a shift template.
                            Each template should contain 'shift_name', 'location_id', 'start_time', and 'end_time'.
    :return: A list of dictionaries, each representing a shift with a date within the current week.
    """
    # Get the current date and calculate the start of the current week (Monday)
    today = datetime.today()
    # Calculate the start of the week (Monday) and the end of the week (Sunday)
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    shifts_new = []
    sid = 1
    for i in range(7):
        # Calculate the date for each day of the week
        current_date = start_of_week + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        # Create a morning and evening shift for each day
        for shift in shift_templates:
            new_shift = {
                "id": sid,
                "shift_id": shift["shift_id"],
                "shift_name": shift["shift_name"],
                "location_id": shift["location_id"],
                "start_time": shift["start_time"],
                "end_time": shift["end_time"],
                "date": date_str
            }
            shifts_new.append(new_shift)
            sid += 1

    return shifts_new
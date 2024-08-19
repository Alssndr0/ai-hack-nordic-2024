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
    start_of_week = today - timedelta(days=today.weekday())  # Monday of the current week

    shifts = []

    for i, template in enumerate(shift_templates):
        current_date = start_of_week + timedelta(days=i % 7)  # Loop within the week
        shift = {
            'id': template['id'],
            'shift_name': template['shift_name'],
            'location_id': template['location_id'],
            'start_time': template['start_time'],
            'end_time': template['end_time'],
            'date': current_date.strftime('%Y-%m-%d')
        }
        shifts.append(shift)

    return shifts
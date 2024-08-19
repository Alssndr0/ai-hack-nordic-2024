from datetime import datetime, timedelta
from ..resolvers.shifts import ShiftCreateInput 

def generate_shifts_for_year(start_date: str, shift_templates: list[ShiftCreateInput]) -> list[ShiftCreateInput]:
    """
    Generate shifts for an entire year starting from the given start date.

    :param start_date: The starting date for generating shifts (format: 'YYYY-MM-DD').
    :param shift_templates: A list of dictionaries, each representing a shift template.
                            Each template should contain 'shift_name', 'location_id', 'start_time', and 'end_time'.
    :return: A list of dictionaries, each representing a shift with a unique date.
    """
    start_date = datetime.strptime(start_date, '%Y-%m-%d')
    shifts = []

    for i in range(365):  # Loop for each day in a year
        current_date = start_date + timedelta(days=i)
        for template in shift_templates:
            shift = {
                'id': f"{template['shift_name'].replace(' ', '_').lower()}_{current_date.strftime('%Y%m%d')}",
                'shift_name': template['shift_name'],
                'location_id': template['location_id'],
                'start_time': template['start_time'],
                'end_time': template['end_time'],
                'date': current_date.strftime('%Y-%m-%d')
            }
            shifts.append(shift)

    return shifts
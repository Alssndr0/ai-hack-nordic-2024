import strawberry
from datetime import datetime, timedelta
import random

@strawberry.type
class EmployeeData:
    first_name: str
    last_name: str
    phone_number: str
    email: str
    address: str
    date_of_birth: str
    emergency_contact: str
    dateHired: str
    contracted_hours: str
    locations: list[str]
    roles: list[str]

def random_date(start, end):
    return start + timedelta(days=random.randint(0, int((end - start).days)))

def generate_employee_data(n=16):
    first_names = ["William", "James", "Emily", "Sophia", "Michael", "Sarah"]
    last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis"]
    streets = ["Main St"]
    cities = ["New York"]
    roles = ["Cook", "Head Chef", "Server","Receptionist"]
    locations = [1]

    employees = []
    for _ in range(n):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        phone_number = f"+44{random.randint(7000000000, 7999999999)}"
        email = f"{first_name.lower()}.{last_name.lower()}@example.com"
        address = f"{random.randint(100, 999)} {random.choice(streets)}, {random.choice(cities)}"
        date_of_birth = random_date(datetime(1960, 1, 1), datetime(2005, 12, 31)).strftime('%Y-%m-%d')
        emergency_contact = f"{random.choice(first_names)} {random.choice(last_names)}, +44{random.randint(7000000000, 7999999999)}"
        dateHired = random_date(datetime(2010, 1, 1), datetime.today()).strftime('%Y-%m-%d')
        contracted_hours = str(random.randint(20, 500))
        employee_locations = random.sample(locations, k=random.randint(1, 3))
        employee_roles = random.sample(roles, k=random.randint(1, 2))

        employee = EmployeeData(
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            email=email,
            address=address,
            date_of_birth=date_of_birth,
            emergency_contact=emergency_contact,
            dateHired=dateHired,
            contracted_hours=contracted_hours,
            locations=employee_locations,
            roles=employee_roles
        )
        
        employees.append(employee)
    
    return employees
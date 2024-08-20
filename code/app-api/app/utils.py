import strawberry

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

sample_json = {
  "input": {
    "business": {
      "id": "1",
      "location_id": "1",
      "name": "Italian Pizzeria",
      "email": "contact@italianpizzeria.com"
    },
    "locations": [
      {
        "id": "1",
        "business_id": "1",
        "name": "Italian Pizzeria Kensington",
        "address": "Central London, Kensington",
        "email": "kensington@italianpizzeria.com"
      }
    ],
    "locationRoles": [
      {
        "id": "1",
        "location_id": "1",
        "role_id": "1"
      },
      {
        "id": "2",
        "location_id": "1",
        "role_id": "2"
      },
      {
        "id": "3",
        "location_id": "1",
        "role_id": "3"
      },
      {
        "id": "4",
        "location_id": "1",
        "role_id": "4"
      }
    ],
    "locationOpeningHours": [
      {
        "id": "1",
        "location_id": "1",
        "day_of_week": 1,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "2",
        "location_id": "1",
        "day_of_week": 2,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "3",
        "location_id": "1",
        "day_of_week": 3,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "4",
        "location_id": "1",
        "day_of_week": 4,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "5",
        "location_id": "1",
        "day_of_week": 5,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "6",
        "location_id": "1",
        "day_of_week": 6,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "7",
        "location_id": "1",
        "day_of_week": 7,
        "open_time": "11:00",
        "close_time": "23:00"
      }
    ],
    "roles": [
      {
        "id": "1",
        "name": "Head Chef",
        "description": "Oversees kitchen operations"
      },
      {
        "id": "2",
        "name": "Cook",
        "description": "Prepares and cooks food"
      },
      {
        "id": "3",
        "name": "Server",
        "description": "Serves food and beverages"
      },
      {
        "id": "4",
        "name": "Receptionist",
        "description": "Manages front desk"
      }
    ],
    "staffRequirements": [
      {
        "id": "1",
        "shift_id": "1",
        "role_id": "1",
        "employees_required": 1
      },
      {
        "id": "2",
        "shift_id": "1",
        "role_id": "2",
        "employees_required": 2
      },
      {
        "id": "3",
        "shift_id": "1",
        "role_id": "3",
        "employees_required": 2
      },
      {
        "id": "4",
        "shift_id": "1",
        "role_id": "4",
        "employees_required": 1
      },
      {
        "id": "5",
        "shift_id": "2",
        "role_id": "1",
        "employees_required": 1
      },
      {
        "id": "6",
        "shift_id": "2",
        "role_id": "2",
        "employees_required": 2
      },
      {
        "id": "7",
        "shift_id": "2",
        "role_id": "3",
        "employees_required": 2
      },
      {
        "id": "8",
        "shift_id": "2",
        "role_id": "4",
        "employees_required": 1
      }
    ],
"shifts": [
    {
        "id": "1",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-19"
    },
    {
        "id": "2",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-19"
    },
    {
        "id": "3",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-20"
    },
    {
        "id": "4",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-20"
    },
    {
        "id": "5",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-21"
    },
    {
        "id": "6",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-21"
    },
    {
        "id": "7",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-22"
    },
    {
        "id": "8",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-22"
    },
    {
        "id": "9",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-23"
    },
    {
        "id": "10",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-23"
    },
    {
        "id": "11",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-24"
    },
    {
        "id": "12",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-24"
    },
    {
        "id": "13",
        "shift_id": "1",
        "shift_name": "Morning",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-25"
    },
    {
        "id": "14",
        "shift_id": "2",
        "shift_name": "Evening",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-25"
    }
]

  }
}


sample_json_old = {
  "input": {
    "business": {
      "id": "1",
      "location_id": "1",
      "name": "Italian Pizzeria",
      "email": "contact@italianpizzeria.com"
    },
    "locations": [
      {
        "id": "1",
        "business_id": "1",
        "name": "Italian Pizzeria Kensington",
        "address": "Central London, Kensington",
        "email": "kensington@italianpizzeria.com"
      }
    ],
    "locationRoles": [
      {
        "id": "1",
        "location_id": "1",
        "role_id": "1"
      },
      {
        "id": "2",
        "location_id": "1",
        "role_id": "2"
      },
      {
        "id": "3",
        "location_id": "1",
        "role_id": "3"
      },
      {
        "id": "4",
        "location_id": "1",
        "role_id": "4"
      }
    ],
    "locationOpeningHours": [
      {
        "id": "1",
        "location_id": "1",
        "day_of_week": 1,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "2",
        "location_id": "1",
        "day_of_week": 2,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "3",
        "location_id": "1",
        "day_of_week": 3,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "4",
        "location_id": "1",
        "day_of_week": 4,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "5",
        "location_id": "1",
        "day_of_week": 5,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "6",
        "location_id": "1",
        "day_of_week": 6,
        "open_time": "11:00",
        "close_time": "23:00"
      },
      {
        "id": "7",
        "location_id": "1",
        "day_of_week": 7,
        "open_time": "11:00",
        "close_time": "23:00"
      }
    ],
    "roles": [
      {
        "id": "1",
        "name": "Head Chef",
        "description": "Oversees kitchen operations"
      },
      {
        "id": "2",
        "name": "Cook",
        "description": "Prepares and cooks food"
      },
      {
        "id": "3",
        "name": "Server",
        "description": "Serves food and beverages"
      },
      {
        "id": "4",
        "name": "Receptionist",
        "description": "Manages front desk"
      }
    ],
    "staffRequirements": [
      {
        "id": "1",
        "shift_id": "1",
        "role_id": "1",
        "employees_required": 1
      },
      {
        "id": "2",
        "shift_id": "1",
        "role_id": "2",
        "employees_required": 2
      },
      {
        "id": "3",
        "shift_id": "1",
        "role_id": "3",
        "employees_required": 2
      },
      {
        "id": "4",
        "shift_id": "1",
        "role_id": "4",
        "employees_required": 1
      },
      {
        "id": "5",
        "shift_id": "2",
        "role_id": "1",
        "employees_required": 1
      },
      {
        "id": "6",
        "shift_id": "2",
        "role_id": "2",
        "employees_required": 2
      },
      {
        "id": "7",
        "shift_id": "2",
        "role_id": "3",
        "employees_required": 2
      },
      {
        "id": "8",
        "shift_id": "2",
        "role_id": "4",
        "employees_required": 1
      },
      {
        "id": "9",
        "shift_id": "3",
        "role_id": "1",
        "employees_required": 1
      },
      {
        "id": "10",
        "shift_id": "3",
        "role_id": "2",
        "employees_required": 2
      },
      {
        "id": "11",
        "shift_id": "3",
        "role_id": "3",
        "employees_required": 2
      },
      {
        "id": "12",
        "shift_id": "3",
        "role_id": "4",
        "employees_required": 1
      },
      {
        "id": "13",
        "shift_id": "4",
        "role_id": "1",
        "employees_required": 1
      },
      {
        "id": "14",
        "shift_id": "4",
        "role_id": "2",
        "employees_required": 2
      },
      {
        "id": "15",
        "shift_id": "4",
        "role_id": "3",
        "employees_required": 2
      },
      {
        "id": "16",
        "shift_id": "4",
        "role_id": "4",
        "employees_required": 1
      }
    ],
    "shifts": [
      {
        "id": "1",
        "shift_id": "1",
        "shift_name": "Morning Weekday",
        "location_id": "1",
        "start_time": "11:00",
        "end_time": "17:00",
        "date": "2024-08-19"
      },
      {
        "id": "2",
        "shift_id": "2",
        "shift_name": "Evening Weekday",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "23:00",
        "date": "2024-08-19"
      },
      {
        "id": "3",
        "shift_id": "3",
        "shift_name": "Morning Weekend",
        "location_id": "1",
        "start_time": "10:00",
        "end_time": "17:00",
        "date": "2024-08-24"
      },
      {
        "id": "4",
        "shift_id": "4",
        "shift_name": "Evening Weekend",
        "location_id": "1",
        "start_time": "17:00",
        "end_time": "00:00",
        "date": "2024-08-24"
      }
    ]
  }
}


employee_data_list = [
            EmployeeData(
                first_name="John",
                last_name="Doe",
                phone_number="+4434567890",
                email="john.doe@example.com",
                address="123 Main St, Kensington",
                date_of_birth="1985-05-15",
                emergency_contact="Jane Doe, +4487654321",
                dateHired="2023-01-01",
                contracted_hours="40",
                locations=["1"],
                roles=["Receptionist"]
            ),
            EmployeeData(
                first_name="Saurabh",
                last_name="Raj",
                phone_number="+4434567890",
                email="john.doe@example.com",
                address="123 Main St, Kensington",
                date_of_birth="1985-05-15",
                emergency_contact="Jane Doe, +4487654321",
                dateHired="2023-01-01",
                contracted_hours="40",
                locations=["1"],
                roles=["Receptionist"]
            ),
            EmployeeData(
                first_name="Alice",
                last_name="Smith",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Receptionist"]
            ),

            EmployeeData(
                first_name="Alessandro",
                last_name="Alviani",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Head Chef"]
            ),
            EmployeeData(
                first_name="Sami",
                last_name="S",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=[ "Head Chef"]
            ),

            EmployeeData(
                first_name="William",
                last_name="Lundqvist",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Cook"]
            ),
            EmployeeData(
                first_name="bob",
                last_name="a",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Cook"]
            ),
                        EmployeeData(
                first_name="Rakesh",
                last_name="P.",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Cook"]
            ),
                        EmployeeData(
                first_name="Shawn",
                last_name="J",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Cook"]
            ),
                        EmployeeData(
                first_name="Tommy",
                last_name="L",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Cook"]
            ),
                        EmployeeData(
                first_name="Hugh",
                last_name="her",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Cook"]
            ),
            
            EmployeeData(
                first_name="Anthony",
                last_name="Markov",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Server"]
            ),
            EmployeeData(
                first_name="Peter",
                last_name="Eng.",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Server"]
            ),
                        EmployeeData(
                first_name="Harry",
                last_name="Potter",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Server"]
            ),
                        EmployeeData(
                first_name="Ryan",
                last_name="Reyn",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Server"]
            ),
                        EmployeeData(
                first_name="Sparrow",
                last_name="Jack",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Server"]
            ),
                        EmployeeData(
                first_name="Benny",
                last_name="Tot",
                phone_number="+4487654321",
                email="alice.smith@example.com",
                address="456 Elm St, Kensington",
                date_of_birth="1990-08-20",
                emergency_contact="Bob Smith, +4434567890",
                dateHired="2023-02-01",
                contracted_hours="500",
                locations=["1"],
                roles=["Server"]
            )
        ]
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
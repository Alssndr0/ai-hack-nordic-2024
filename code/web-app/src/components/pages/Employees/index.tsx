import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Card, Text, Image, Stack, Modal, Button, Container, Title, TextInput, NumberInput, MultiSelect, Box } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

interface EmployeeProps {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    dateOfBirth: Date;
    emergencyContact: string;
    dateHired: Date;
    contractedHours: number;
    locations: string[];
    roles: string[];
    imageUrl: string;
}

const avatar: string = 'https://th.bing.com/th?q=Waiter+Speaking+Icon&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=2.5&pid=InlineBlock&mkt=en-GB&cc=GB&setlang=en&adlt=moderate&t=1&mw=247';

// Sample employee data
const employeesData: EmployeeProps[] = [
    {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        address: "123 Main St, London",
        dateOfBirth: new Date("1985-06-15"),
        emergencyContact: "Jane Doe, +44 123 456 789",
        dateHired: new Date("2021-03-01"),
        contractedHours: 40,
        locations: ["London"],
        roles: ["Waiter"],
        imageUrl: avatar
    },
    {
        firstName: "Emma",
        lastName: "Johnson",
        email: "emma.johnson@example.com",
        address: "45 Queen's Road, Stockholm",
        dateOfBirth: new Date("1992-11-23"),
        emergencyContact: "Michael Johnson, +46 987 654 321",
        dateHired:  new Date("2019-07-15"),
        contractedHours: 35,
        locations: ["Stockholm"],
        roles: ["Receptionist"],
        imageUrl: avatar
    },
    {
        firstName: "Liam",
        lastName: "Smith",
        email: "liam.smith@example.com",
        address: "77 King's Avenue, London",
        dateOfBirth: new Date("1988-02-02"),
        emergencyContact: "Olivia Smith, +44 321 654 987",
        dateHired: new Date("2020-10-10"),
        contractedHours: 40,
        locations: ["London"],
        roles: ["Chef"],
        imageUrl: avatar
    },
    {
        firstName: "Sophia",
        lastName: "Brown",
        email: "sophia.brown@example.com",
        address: "19 Park Lane, Stockholm",
        dateOfBirth: new Date("1990-09-14"),
        emergencyContact: "Henry Brown, +46 555 666 777",
        dateHired:  new Date("2018-02-20"),
        contractedHours: 30,
        locations: ["Stockholm"],
        roles: ["Waiter"],
        imageUrl: avatar
    },
    {
        firstName: "Noah",
        lastName: "Taylor",
        email: "noah.taylor@example.com",
        address: "33 River St, London",
        dateOfBirth: new Date("1995-12-01"),
        emergencyContact: "Ava Taylor, +44 987 654 321",
        dateHired:  new Date("2022-06-12"),
        contractedHours: 20,
        locations: ["London"],
        roles: ["Cook"],
        imageUrl: avatar
    },
    {
        firstName: "Mia",
        lastName: "Wilson",
        email: "mia.wilson@example.com",
        address: "84 Maple Dr, Stockholm",
        dateOfBirth: new Date("1993-04-10"),
        emergencyContact: "Lucas Wilson, +46 123 456 789",
        dateHired:  new Date("2021-01-08"),
        contractedHours: 25,
        locations: ["Stockholm"],
        roles: ["Receptionist"],
        imageUrl: avatar
    },
    {
        firstName: "James",
        lastName: "Anderson",
        email: "james.anderson@example.com",
        address: "66 Elm St, London",
        dateOfBirth: new Date("1987-08-30"),
        emergencyContact: "Charlotte Anderson, +44 654 321 987",
        dateHired:  new Date("2017-11-05"),
        contractedHours: 40,
        locations: ["London"],
        roles: ["Chef"],
        imageUrl: avatar
    },
    {
        firstName: "Isabella",
        lastName: "Thomas",
        email: "isabella.thomas@example.com",
        address: "21 Oak Ln, Stockholm",
        dateOfBirth: new Date("1996-05-25"),
        emergencyContact: "William Thomas, +46 444 555 666",
        dateHired:  new Date("2020-03-19"),
        contractedHours: 30,
        locations: ["Stockholm"],
        roles: ["Waiter"],
        imageUrl: avatar
    },
    {
        firstName: "Ethan",
        lastName: "Walker",
        email: "ethan.walker@example.com",
        address: "5 Cherry St, London",
        dateOfBirth: new Date("1994-03-18"),
        emergencyContact: "Amelia Walker, +44 789 012 345",
        dateHired:  new Date("2019-05-23"),
        contractedHours: 25,
        locations: ["London"],
        roles: ["Cook"],
        imageUrl: avatar
    },
    {
        firstName: "Olivia",
        lastName: "Martinez",
        email: "olivia.martinez@example.com",
        address: "12 Pine Rd, Stockholm",
        dateOfBirth: new Date("1989-07-07"),
        emergencyContact: "Liam Martinez, +46 321 987 654",
        dateHired:  new Date("2016-08-14"),
        contractedHours: 40,
        locations: ["Stockholm"],
        roles: ["Receptionist"],
        imageUrl: avatar
    }
];

const EmployeeTile: React.FC<Partial<EmployeeProps> & { onClick: () => void }> = ({ firstName, lastName, roles, locations, imageUrl, onClick }) => {
    return (
        <Card shadow="sm" padding="lg" onClick={onClick} style={{ cursor: 'pointer', width: '100%' }}>
            <div style={styles.container}>
                <Image src={imageUrl}  height={100} width={100} style={styles.image} />
                <div style={styles.textContainer}>
                    <Text size="lg">
                        {firstName + ' ' + lastName} <span style={{ fontSize: '0.8em', color: 'gray' }}></span>
                    </Text>
                    <Text size="sm" color="dimmed">{roles?.join(', ')}</Text>
                    <Text size="sm" color="dimmed">{locations?.join(', ')}</Text>
                </div>
            </div>
        </Card>
    );
};

export default function EmployeeList() {
    const [employees, setEmployees] = useState<EmployeeProps[]>(employeesData);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProps | null>(null);
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [opened, setOpened] = useState(false);
    const defaultEmployeeData: EmployeeProps = {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        dateOfBirth: new Date(),
        emergencyContact: '',
        dateHired: new Date(),
        contractedHours: 0,
        locations: [],
        roles: [],
        imageUrl: avatar
    };
    const [employeeData, setEmployeeData] = useState(defaultEmployeeData);
    const locationOptions = ['London, United Kingdom', 'Stockholm, Sweden'];
    const roleOptions = ['Chef', 'Cook', 'Waiter', 'Receptionist', 'Cleaner'];

    const handleInputChange = (field: keyof EmployeeProps, value: any) => {
        setEmployeeData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field: keyof EmployeeProps, value: string[]) => {
        setEmployeeData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        setEmployees(prev => [...prev, employeeData]);
        setEmployeeData(defaultEmployeeData);
        setOpened(false);
    };

    const handleTileClick = (employee: EmployeeProps) => {
        setSelectedEmployee(employee);
        setModalOpened(true);
    };

    const handleCloseModal = () => {
        setModalOpened(false);
        setSelectedEmployee(null);
    };

    return (
        <Container>
            <div style={styles.header}>
                <Title order={2}>Manage Employees</Title>
                <Button onClick={() => setOpened(true)}>Add Employee +</Button>
            </div>

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Add New Employee"
                size="xl"
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <TextInput
                        label="First Name"
                        placeholder="Enter your first name"
                        value={employeeData.firstName}
                        onChange={(event) => handleInputChange('firstName', event.currentTarget.value)}
                        required
                        mb="sm"
                    />
                    <TextInput
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={employeeData.lastName}
                        onChange={(event) => handleInputChange('lastName', event.currentTarget.value)}
                        required
                        mb="sm"
                    />
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={employeeData.email}
                        onChange={(event) => handleInputChange('email', event.currentTarget.value)}
                        required
                        mb="sm"
                    />
                    <TextInput
                        label="Address"
                        placeholder="Enter your address"
                        value={employeeData.address}
                        onChange={(event) => handleInputChange('address', event.currentTarget.value)}
                        required
                        mb="sm"
                    />
                    <DatePickerInput
                        label="Date of Birth"
                        placeholder="Select date of birth"
                        value={employeeData.dateOfBirth}
                        onChange={(date) => handleInputChange('dateOfBirth', date)}
                        valueFormat="DD-MM-YYYY"
                        required
                        mb="sm"
                    />
                    <TextInput
                        label="Emergency Contact"
                        placeholder="Enter emergency contact"
                        value={employeeData.emergencyContact}
                        onChange={(event) => handleInputChange('emergencyContact', event.currentTarget.value)}
                        required
                        mb="sm"
                    />
                    <DatePickerInput
                        label="Date Hired"
                        placeholder="Select date hired"
                        value={employeeData.dateHired}
                        onChange={(date) => handleInputChange('dateHired', date)}
                        valueFormat="DD-MM-YYYY"
                        required
                        mb="sm"
                    />
                    <NumberInput
                        label="Contracted Hours"
                        placeholder="Enter contracted hours"
                        value={employeeData.contractedHours}
                        onChange={(value) => handleInputChange('contractedHours', value)}
                        required
                        mb="sm"
                    />
                    <MultiSelect
                        label="Locations"
                        placeholder="Select locations"
                        data={locationOptions}
                        value={employeeData.locations}
                        onChange={(value: string[]) => handleMultiSelect('locations', value)}
                        required
                        mb="sm"
                    />
                    <MultiSelect
                        label="Roles"
                        placeholder="Select roles"
                        data={roleOptions}
                        value={employeeData.roles}
                        onChange={(value: string[]) => handleMultiSelect('roles', value)}
                        required
                        mb="sm"
                    />
                    <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Button type="submit">Add Employee</Button>
                    </Box>
                </form>
            </Modal>

            <Stack justify="lg" style={{ marginTop: '20px' }}>
                {employees.map((employee) => (
                    <EmployeeTile
                        key={employee.firstName + ' ' + employee.lastName}
                        firstName={employee.firstName}
                        lastName={employee.lastName}
                        roles={employee.roles}
                        imageUrl={avatar}
                        locations={employee.locations}
                        contractedHours={employee.contractedHours}
                        emergencyContact={employee.emergencyContact}
                        dateOfBirth={employee.dateOfBirth}
                        email={employee.email}
                        address={employee.address}
                        dateHired={employee.dateHired}
                        onClick={() => handleTileClick(employee)}
                    />
                ))}
            </Stack>

            <Modal
                opened={modalOpened}
                onClose={handleCloseModal}
                title={selectedEmployee?.firstName || ''}
                size="lg"
            >
                {selectedEmployee && (
                    <Stack align="center" justify="sm">
                        <Image
                            src={selectedEmployee.imageUrl}
                            alt={selectedEmployee.firstName}
                            style={{ objectFit: 'cover', borderRadius: '50%', height: '200px', width: '200px' }}
                        />
                        <div style={styles.infoContainer}>
                            <Text><strong>Name:</strong> {selectedEmployee.firstName + ' ' + selectedEmployee.lastName}</Text>
                            <Text>
                                <strong>Date of Birth:</strong>
                                {new Date(selectedEmployee.dateOfBirth).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </Text>
                            <Text><strong>Designation:</strong> {selectedEmployee.roles.join(', ')}</Text>
                            <Text><strong>Location:</strong> {selectedEmployee.locations.join(', ')}</Text>
                            <Text><strong>Contracted Hours:</strong> {selectedEmployee.contractedHours}</Text>
                            <Text><strong>Emergency Contact:</strong> {selectedEmployee.emergencyContact}</Text>
                            <Text><strong>Date Hired:</strong> {new Date(selectedEmployee.dateHired).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}</Text>
                            <Text><strong>Email:</strong> {selectedEmployee.email}</Text>
                            <Text><strong>Address:</strong> {selectedEmployee.address}</Text>
                        </div>
                    </Stack>
                )}
            </Modal>
        </Container>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row' as 'row'
    },
    image: {
        marginRight: '20px',
        borderRadius: '50%',
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        justifyContent: 'center',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'flex-start',
        marginTop: '20px',
    },
};


import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Card, Text, Image, Stack, Modal, Button, Container, Title, TextInput, NumberInput, MultiSelect, Box, Flex } from '@mantine/core';
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
    }
];

const EmployeeTile: React.FC<Partial<EmployeeProps> & { onClick: () => void }> = ({ firstName, lastName, roles, locations, imageUrl, onClick }) => {
    return (
        <Card shadow="sm" padding="lg" onClick={onClick} style={{ cursor: 'pointer', width: '100%' }}>
            <div style={styles.container}>
                <Image src={imageUrl} height={100} width={100} style={styles.image} />
                <div style={styles.textContainer}>
                    <Text size="lg">{firstName + ' ' + lastName}</Text>
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
    const [editMode, setEditMode] = useState<boolean>(false);
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
    const [employeeData, setEmployeeData] = useState<EmployeeProps>(defaultEmployeeData);
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
        setSelectedEmployee({ ...employee });
        setModalOpened(true);
    };

    const handleCloseModal = () => {
        setModalOpened(false);
        setSelectedEmployee(null);
        setEditMode(false);
    };

    const handleModalInputChange = (field: keyof EmployeeProps, value: any) => {
        if (selectedEmployee) {
            setSelectedEmployee(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleSaveChanges = () => {
        if (selectedEmployee) {
            // Update employee list with new details
            setEmployees(prev =>
                prev.map(emp =>
                    emp.email === selectedEmployee.email ? selectedEmployee : emp
                )
            );
            setEditMode(false);
            handleCloseModal(); // Close modal after saving changes
        }
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
                        key={employee.email}
                        firstName={employee.firstName}
                        lastName={employee.lastName}
                        roles={employee.roles}
                        imageUrl={employee.imageUrl}
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
                title="Employee Details"
                size="lg"
            >
                {selectedEmployee && (
                    <Flex direction="row" align="flex-start">
                        <Image
                            src={selectedEmployee.imageUrl}
                            height={100}
                            width={100}
                            style={{ borderRadius: '50%', marginRight: '20px' }}
                        />
                        <Stack justify="sm" style={{ flex: 1 }}>
                            <TextInput
                                label="First Name"
                                value={selectedEmployee.firstName}
                                readOnly={!editMode}
                                onChange={(e) => handleModalInputChange('firstName', e.target.value)}
                            />
                            <TextInput
                                label="Last Name"
                                value={selectedEmployee.lastName}
                                readOnly={!editMode}
                                onChange={(e) => handleModalInputChange('lastName', e.target.value)}
                            />
                            <DatePickerInput
                                label="Date of Birth"
                                value={selectedEmployee.dateOfBirth}
                                readOnly={!editMode}
                                onChange={(date) => handleModalInputChange('dateOfBirth', date)}
                                valueFormat="DD-MM-YYYY"
                            />
                            <TextInput
                                label="Email"
                                value={selectedEmployee.email}
                                readOnly={!editMode}
                                onChange={(e) => handleModalInputChange('email', e.target.value)}
                            />
                            <TextInput
                                label="Address"
                                value={selectedEmployee.address}
                                readOnly={!editMode}
                                onChange={(e) => handleModalInputChange('address', e.target.value)}
                            />
                            <TextInput
                                label="Emergency Contact"
                                value={selectedEmployee.emergencyContact}
                                readOnly={!editMode}
                                onChange={(e) => handleModalInputChange('emergencyContact', e.target.value)}
                            />
                            <DatePickerInput
                                label="Date Hired"
                                value={selectedEmployee.dateHired}
                                readOnly={!editMode}
                                onChange={(date) => handleModalInputChange('dateHired', date)}
                                valueFormat="DD-MM-YYYY"
                            />
                            <NumberInput
                                label="Contracted Hours"
                                value={selectedEmployee.contractedHours}
                                readOnly={!editMode}
                                onChange={(value) => handleModalInputChange('contractedHours', value)}
                            />
                            <MultiSelect
                                label="Locations"
                                data={locationOptions}
                                value={selectedEmployee.locations}
                                readOnly={!editMode}
                                onChange={(value) => handleModalInputChange('locations', value)}
                            />
                            <MultiSelect
                                label="Roles"
                                data={roleOptions}
                                value={selectedEmployee.roles}
                                readOnly={!editMode}
                                onChange={(value) => handleModalInputChange('roles', value)}
                            />
                            <Flex justify="flex-end" style={{ marginTop: '20px' }}>
                                {editMode ? (
                                    <>
                                        <Button onClick={handleSaveChanges}>Save</Button>
                                        <Button onClick={() => setEditMode(false)} style={{ marginLeft: '10px' }}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setEditMode(true)}>Edit</Button>
                                )}
                            </Flex>
                        </Stack>
                    </Flex>
                )}
            </Modal>
        </Container>
    );
}

// Styles
const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
    },
    image: {
        borderRadius: '50%',
    },
    textContainer: {
        marginLeft: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
};


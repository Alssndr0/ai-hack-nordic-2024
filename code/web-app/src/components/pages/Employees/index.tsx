import React, { useEffect, useId, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Card, Text, Image, Stack, Modal, Button, Container, Title, TextInput, NumberInput, MultiSelect, Box, Flex, FileInput, Select, Accordion, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMutation, useQuery } from '@apollo/client';
import { POST_EMPLOYEE, QUERY_EMPLOYEES, QUERY_LOCATIONS, UPLOAD_EMPLOYEE_FILES_MUTATION } from "../../../graphql/items";
import { IconBrain, IconEyePlus, IconPlus } from '@tabler/icons-react';

interface EmployeeProps {
    employeeId: string;
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
}

const avatar: string = 'https://th.bing.com/th?q=Waiter+Speaking+Icon&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=2.5&pid=InlineBlock&mkt=en-GB&cc=GB&setlang=en&adlt=moderate&t=1&mw=247';


const EmployeeTile: React.FC<Partial<EmployeeProps> & { onClick: () => void }> = ({ contractedHours, firstName, lastName, address, onClick }) => {
    return (
        <Card withBorder padding="lg" onClick={onClick} style={{ cursor: 'pointer', width: '100%' }}>
            <div style={styles.container}>
                <Image src={null} height={100} width={100} style={styles.image} fallbackSrc={"https://placehold.co/400x400?text="+firstName![0]+lastName![0]} />
                <div style={styles.textContainer}>
                    <Text size="lg">{firstName + ' ' + lastName}</Text>
                    <Text size="sm" color="dimmed">Contracted Hours: {contractedHours}</Text>
                    <Text size="sm" color="dimmed">Address: {address}</Text>
                </div>
            </div>
        </Card>
    );
};

const CreateEmployee = ({readOnly, btnLabel, onChange, submit, locationOptions, roleOptions, hideBtn, defaultEmployee}: {btnLabel?: string, readOnly?: boolean, defaultEmployee?: EmployeeProps, hideBtn?: boolean, onChange?: (data: EmployeeProps) => void, submit: (data: EmployeeProps) => void, locationOptions: string[], roleOptions: string[]}) => {
    const guid = useId();
    const defaultEmployeeData: EmployeeProps = defaultEmployee ?? {
        employeeId: guid,
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
    };
    const [employeeData, setEmployeeData] = useState<EmployeeProps>(defaultEmployeeData);

    const handleInputChange = (field: keyof EmployeeProps, value: any) => {
        setEmployeeData(prev => ({ ...prev, [field]: value }));
        onChange?.({ ...employeeData, [field]: value })
    };

    const handleMultiSelect = (field: keyof EmployeeProps, value: string[]) => {
        setEmployeeData(prev => ({ ...prev, [field]: value }));
        onChange?.({ ...employeeData, [field]: value })
    };

    return <form style={{flex: "1"}} onSubmit={(e) => { e.preventDefault(); submit(employeeData); setEmployeeData(defaultEmployeeData) }}>
    <TextInput
        label="First Name"
        placeholder="Enter your first name"
        value={employeeData.firstName}
        onChange={(event) => handleInputChange('firstName', event.currentTarget.value)}
        required
        readOnly={readOnly}
        mb="sm"
    />
    <TextInput
        label="Last Name"
        placeholder="Enter your last name"
        value={employeeData.lastName}
        onChange={(event) => handleInputChange('lastName', event.currentTarget.value)}
        required
        readOnly={readOnly}
        mb="sm"
    />
    <TextInput
        label="Email"
        placeholder="Enter your email"
        value={employeeData.email}
        onChange={(event) => handleInputChange('email', event.currentTarget.value)}
        required
        readOnly={readOnly}
        mb="sm"
    />
    <TextInput
        label="Address"
        placeholder="Enter your address"
        value={employeeData.address}
        onChange={(event) => handleInputChange('address', event.currentTarget.value)}
        required
        readOnly={readOnly}
        mb="sm"
    />
    <DatePickerInput
        label="Date of Birth"
        placeholder="Select date of birth"
        value={employeeData.dateOfBirth}
        onChange={(date) => handleInputChange('dateOfBirth', date)}
        valueFormat="DD-MM-YYYY"
        required
        readOnly={readOnly}
        mb="sm"
    />
    <TextInput
        label="Emergency Contact"
        placeholder="Enter emergency contact"
        value={employeeData.emergencyContact}
        onChange={(event) => handleInputChange('emergencyContact', event.currentTarget.value)}
        required
        readOnly={readOnly}
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
        readOnly={readOnly}
        mb="sm"
    />
    <MultiSelect
        label="Locations"
        placeholder="Select locations"
        data={locationOptions}
        value={employeeData.locations}
        onChange={(value: string[]) => handleMultiSelect('locations', value)}
        required
        readOnly={readOnly}
        mb="sm"
    />
    <MultiSelect
        label="Roles"
        placeholder="Select roles"
        data={roleOptions}
        value={employeeData.roles}
        onChange={(value: string[]) => handleMultiSelect('roles', value)}
        required
        readOnly={readOnly}
        mb="sm"
    />
    {!hideBtn &&
    <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button type="submit">{btnLabel ?? "Add Employee"}</Button>
    </Box>}
</form>
}

export default function EmployeeList() {
    const [employees, setEmployees] = useState<EmployeeProps[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProps | null>(null);
    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [opened, setOpened] = useState(false);
    const [openedFile, setOpenedFile] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeProps[]>([]); // Holds employees filtered by location
    const [selectedLocation, setSelectedLocation] = useState(''); // Selected location from the dropdown
    const [locationOptions, setLocationOptions] = useState([]);
    const [uploadEmployeeFiles] = useMutation(UPLOAD_EMPLOYEE_FILES_MUTATION);
    const [uploadEmployee] = useMutation(POST_EMPLOYEE);
    const [validateEmployees, setValidateEmployees] = useState<EmployeeProps[]>([]);
    const {data: fetchedEmpData} = useQuery(QUERY_EMPLOYEES)
    const {data: locations} = useQuery(QUERY_LOCATIONS)

    const roleOptions = ['Chef', 'Cook', 'Waiter', 'Receptionist', 'Cleaner'];

    useEffect(() => {
        if(fetchedEmpData && fetchedEmpData.employees) {
            const employees = fetchedEmpData.employees.map((emp: any) => {
                return {...emp, 
                    dateOfBirth: new Date(emp.dateOfBirth),
                    dateHired: emp.dateHired ? new Date(emp.dateHired) : new Date(),
                    contractedHours: parseInt(emp.contractedHours)
                }
            })
            setEmployees(employees)
            setFilteredEmployees(employees);
        }
    }, [fetchedEmpData])

    useEffect(() => {
        if(locations && locations.locations) {
            setLocationOptions(locations.locations.map((l: any) => l.name))
        }
    }, [locations])


    const handleLocationChange = (location: any) => {
        setSelectedLocation(location);
        filterEmployeesByLocation(location);
    };

    // Filter employees by the selected location
    const filterEmployeesByLocation = (location: string) => {
        if (!location) {
            setFilteredEmployees(employees); // Show all employees if no location is selected
        } else {
            setFilteredEmployees(employees.filter(employee => employee.locations.includes(location)));
        }
    };

    const handleSubmit = async (data: EmployeeProps) => {
        const pData = {
            ...data,
            dateOfBirth: data.dateOfBirth.toISOString(),
            dateHired: data.dateHired.toISOString(),
            contractedHours: data.contractedHours.toString(),
        }
        await uploadEmployee({variables: pData});
        setEmployees(prev => [...prev, data]);
        setFilteredEmployees(prev => [...prev, data]);
        setOpened(false);
    };

    const handleTileClick = (employee: EmployeeProps) => {
        setSelectedEmployee({ ...employee });
        console.log("SELECTED EMPLOYEE", employee);
        setModalOpened(true);
    };

    const handleCloseModal = () => {
        setModalOpened(false);
        setSelectedEmployee(null);
        setEditMode(false);
    };

    const handleSaveChanges = () => {
        if (selectedEmployee) {
            setEmployees(prev =>
                prev.map(emp =>
                    emp.email === selectedEmployee.email ? selectedEmployee : emp
                )
            );
            setEditMode(false);
            handleCloseModal(); 
        }
    };

    const handleFileChange = (files: any) => {
        setSelectedFiles(files);
    };


    async function sendContract() {
        if (!selectedFiles || selectedFiles.length === 0) {
            console.error("No files selected");
            return;
        }
    
        try {
            const { data } = await uploadEmployeeFiles({
                variables: {
                    files: ["tmp/contract1.docx","tmp/contract2.docx"],
                },
            });
    
            if (data && data.processEmployeeFiles) {
                const newEmployees: any[] = data.processEmployeeFiles;
                console.log("EMPLOYEES", newEmployees.map(emp => {
                    return {...emp, 
                        dateOfBirth: new Date(emp.dateOfBirth),
                        dateHired: emp.dateHired ?? new Date(emp.dateHired),
                        contractedHours: parseInt(emp.contractedHours)
                    }
                }));

                setValidateEmployees(newEmployees.map(emp => {
                    return {...emp, 
                        employeeId: Math.random() * 100 + "ID",
                        dateOfBirth: new Date(emp.dateOfBirth),
                        dateHired: emp.dateHired ? new Date(emp.dateHired) : new Date(),
                        contractedHours: parseInt(emp.contractedHours)
                    }
                }));
                //setEmployees((prevEmployees) => [...prevEmployees, ...newEmployees]);
            }
        } catch (error) {
            console.error("Error uploading files:", error);
        }
    }

    return (
        <Container pt={"md"}>
            <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title order={2}>Manage Employees</Title>
                <Group align="center" gap={"md"}>
                    <Button leftSection={<IconPlus />} onClick={() => setOpened(true)} style={{ marginRight: '10px' }}>Add Employee</Button>
                    <Button leftSection={<IconEyePlus />} onClick={() => setOpenedFile(true)}>Smart Add Employee</Button>
                </Group>
            </div>

            <div style={{ marginTop: '20px', marginBottom: '20px', width: '200px' }}>
                <Select
                    label="Filter by Location"
                    placeholder="Select location"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    data={locationOptions} // Options come from state
                    clearable
                />
            </div>
            <Modal
                opened={openedFile}
                onClose={() => setOpenedFile(false)}
                onChange={handleFileChange}
                title="Add Employee Contract"
                size="sm"
            >
                    <FileInput
                        multiple
                        label="Input Contract"
                        placeholder=".doc, .pdf"
                    />
                    <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Button type="submit" onClick={sendContract}>Add Employee</Button>
                    </Box>
            </Modal>
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Add New Employee"
                size="xl"
            >
                <CreateEmployee locationOptions={locationOptions} roleOptions={roleOptions} submit={handleSubmit} />
            </Modal>
            <Modal
                opened={validateEmployees.length > 0}
                onClose={() => setValidateEmployees([])}
                title="Validate New Employees"
                size="xl"
            >
                <Accordion variant="separated">
                    {validateEmployees.map(emp => {
                        return <Accordion.Item key={emp.employeeId} value={JSON.stringify(emp)}>
                            <Accordion.Control>{emp.firstName + " " + emp.lastName}</Accordion.Control>
                            <Accordion.Panel>
                                <CreateEmployee submit={() => {}} defaultEmployee={emp} hideBtn={true} locationOptions={locationOptions} roleOptions={roleOptions} />
                            </Accordion.Panel>
                        </Accordion.Item>
                    })}
                </Accordion>
                <Button mt={"md"} onClick={async () => {
                    for(let emp of validateEmployees) {
                        await handleSubmit(emp);
                    }
                    setValidateEmployees([])
                }}>Create employees</Button>
            </Modal>

            <Stack justify="lg">
                {filteredEmployees.map((employee) => (
                    <EmployeeTile
                        key={employee.email}
                        firstName={employee.firstName}
                        lastName={employee.lastName}
                        roles={employee.roles}
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
                size="xl"
            >
                {selectedEmployee && (
                    <Flex direction="row" align="flex-start" w={"100%"}>
                        <Image
                            fallbackSrc={"https://placehold.co/400x400?text="+selectedEmployee.firstName![0]+selectedEmployee.lastName![0]}
                            src={null}
                            height={100}
                            width={100}
                            style={{ borderRadius: '50%', marginRight: '20px' }}
                        />
                        <CreateEmployee btnLabel='Save Edit' defaultEmployee={selectedEmployee} locationOptions={locationOptions} roleOptions={roleOptions} submit={handleSaveChanges} />
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

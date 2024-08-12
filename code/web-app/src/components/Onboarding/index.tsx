import { Button, Center, Text, Flex, Group, Paper, rem, Stack, Title, TextInput, Stepper, TagsInput, Accordion, Divider, RangeSlider, NumberInput, SegmentedControl, Table, Checkbox, UnstyledButton, Container, Textarea, Loader, Switch, Tabs, Input, ActionIcon } from "@mantine/core";
import { WrapperProps } from "../Wrapper/Wrapper";
import { useEffect, useState } from "react";
import { TimeInput } from '@mantine/dates';
import { useForm, UseFormReturnType } from '@mantine/form';
import { randomId } from "@mantine/hooks";
import React from "react";
import "./index.css";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const Welcome = () => {
    return <Flex flex={1} direction={"column"} justify={"center"}>
            <Stack align="center" w={"100%"} gap={0}>
                <Title ta={"center"} fw={"normal"} order={2} mb={rem(5)}>Welcome to <strong>Scheduler!</strong></Title>
                <Text mb={0} ta={"center"} fw={600} opacity={0.7} mt={0}>Before we get started, we need some information!</Text>
            </Stack>
        </Flex>
}

const Step2 = (props: {form: UseFormReturnType<any>}) => {
    return <Flex flex={1} direction={"column"} justify={"start"}>
            <Stack align="center" w={"100%"} gap={0}>
                <Text mb={0} ta={"center"} fw={600} opacity={0.7} mt={0}>Business information</Text>
            </Stack>
            <Stack w={"100%"} mb={"lg"}>
                <TextInput label="Name of business" key={props.form.key('name')} {...props.form.getInputProps("name")} />
                <TagsInput
                    label="Employee Roles"
                    description="Press Enter to submit a role"
                    placeholder="Chef, Waiter, Cook..."
                    clearable
                    key={props.form.key('roles')}
                    {...props.form.getInputProps("roles")}
                    />
                <TagsInput
                    label="Locations"
                    description="Press Enter to submit a role"
                    placeholder="West Mall, City center, London..."
                    clearable
                    key={props.form.key('locations')}
                    {...props.form.getInputProps("locations")}
                    />    
            </Stack>
        </Flex>
}

const EditPerLocation = (props: {form: UseFormReturnType<any>, keys: string[], displayKey: string}) => {
    const [activeDay, setDay] = useState<string|null>(null)
    const locations = props.form.getValues().locations;
    
    const setNewLocationValue = (value: any) => {
        console.log("VALUE", value)
        let ogValue = {...props.form.getValues().locationData};
        for(let key of props.keys) {
            if(!ogValue[key]) {
                ogValue[key] = {};
            }
            ogValue[key][activeDay!] = {...(ogValue[key][activeDay!] ?? {}), ...value};
        } 
        console.log("VALUE", ogValue, props.keys)
        props.form.setValues({
            locationData: ogValue
        })
    }

    const onStartingTimeChange = (value: string) => {
        setNewLocationValue({
            openingTime: value
        })
    }

    const onClosingTimeChange = (value: string) => {
        setNewLocationValue({
            closingTime: value
        })
    }

    const get = () => {
        return props.form.getValues().locationData?.[props.displayKey]?.[activeDay ?? "INVALID"] ?? {};
    }

    const Btn = (name: string) => {
        return <Button onClick={() => setDay(name)} variant={activeDay == name ? "filled" : "outline"}>{name}</Button>
    }
    

    return <>
            <Text size={"sm"} fw={600} mb={"sm"}>Open days</Text>
            <Group grow>
                {Btn("Mon")}
                {Btn("Tue")}
                {Btn("Wed")}
                {Btn("Thu")}
                {Btn("Fri")}
                {Btn("Sat")}
                {Btn("Sun")}
            </Group>
            {activeDay && <React.Fragment key={activeDay}>
                <Divider my={"md"} />
                <Group grow>
                    <TimeInput
                        defaultValue={get()?.openingTime ?? ""}
                        onBlur={e => onStartingTimeChange(e.target.value)}
                        label="Opening Time"
                    />
                    <TimeInput
                        defaultValue={get()?.closingTime ?? ""}
                        onBlur={e => onClosingTimeChange(e.target.value)}
                        label="Closing Time"
                    />
                </Group>
                <Text size={"sm"} mt={"xl"} fw={600} mb={"sm"}>Number of shifts per working day</Text>
                <NumberInput defaultValue={get()?.shifts ?? ""}
                        onChange={e => setNewLocationValue({
                            shifts: e as number
                        })} />
                <Accordion mt={"md"} variant="separated">
                    {Array(get().shifts ?? 0).fill(0).map((e,i) => {
                        console.log(i)
                        return <Accordion.Item value={i.toString()}>
                    
                        <Accordion.Control>Shift {i+1}</Accordion.Control>
                        <Accordion.Panel>
                        <Table verticalSpacing="sm">
                            <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Needed</Table.Th>
                                <Table.Th>Role</Table.Th>
                                <Table.Th>Number of employees</Table.Th>
                            </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                            {props.form.getValues().roles.map((role: string) => (
                                <Table.Tr>
                                    <Table.Td>
                                    <Checkbox defaultChecked={get().shiftData?.[i]?.[role]} onChange={(c) => {
                                        const shifts = get().shiftData ?? {};
                                        const shift = shifts[i] ?? {};
                                        if(!c) {
                                            delete shift[role];
                                            setNewLocationValue({
                                                shiftData: {...shifts}
                                            })
                                        } else {
                                            setNewLocationValue({
                                                shiftData: {...shifts, [i]: {...shift,
                                                    [role]: {num: 1}
                                                }}
                                            })
                                        }
                                    }} />
                                    </Table.Td>
                                    <Table.Td>
                                            <Group gap="sm">
                                                <Text size="sm" fw={500}>
                                                {role}
                                                </Text>
                                            </Group>
                                    </Table.Td>
                                    <Table.Td><NumberInput 
                                    maw={150} 
                                    onChange={(c) => {
                                        const shifts = get().shiftData ?? {};
                                        const shift = shifts[i] ?? {};
                
                                        setNewLocationValue({
                                            shiftData: {...shifts, [i]: {...shift,
                                                [role]: {num: c}
                                            }}
                                        })
                                    
                                    }}
                                    defaultValue={get().shiftData?.[i]?.[role]?.num ?? 0} /></Table.Td>
                                </Table.Tr>
                                ))
                            }
                            </Table.Tbody>
                        </Table>
                        </Accordion.Panel>
                    </Accordion.Item>
                    })}
                </Accordion>
            </React.Fragment>}
        </>
}

const Step3 = (props: {form: UseFormReturnType<any>}) => {
    const [single, setSingle] = useState<boolean>(true);
    const locations = props.form.getValues().locations;
    if(locations.length == 0) {
        return <Text>No locations selected, please add atleast one location in the previous step</Text>
    }

    return <Flex flex={1} direction={"column"} justify={"start"}>
        <Stack align="center" w={"100%"} gap={0} mb={"lg"}>
            <Text mb={0} ta={"center"} fw={600} opacity={0.7} mt={0}>Scheduling Information for each Location</Text>
        </Stack>
        <Stack w={"100%"} mb={"lg"}>
            <SegmentedControl onChange={(v) => setSingle(v == "single")} data={[
                { label: 'Same Scheduling on all locations', value: 'single' },
                { label: 'Different per location', value: 'all' }]} />
            {single == false && 
            <Accordion variant="separated" defaultValue={"1"}>
                 {locations.map((loc: string) => {
                        return <Accordion.Item value={loc}>
                        <Accordion.Control>{loc}</Accordion.Control>
                        <Accordion.Panel>
                            <EditPerLocation form={props.form} displayKey={loc} keys={locations} />
                        </Accordion.Panel>
                    </Accordion.Item>
                })} 
            </Accordion>}
            {single && <Stack gap={0}><EditPerLocation form={props.form} displayKey="*" keys={[...locations, "*"]} /></Stack>}
        </Stack>
    </Flex>
}

export default function Onboarding(props: WrapperProps) {
    const mockData = {
        locations: [{
            name: "West London",
            mon: {
                opening: "08:00",
                closing: "23:00",
                shifts: [
                    {
                        start: "08:00",
                        end: "12:00",
                        roles: [
                            {
                                type: "Chef",
                                amount: 1
                            },
                            {
                                type: "Waiter",
                                amount: 3
                            }
                        ]
                    },
                    {
                        start: "12:00",
                        end: "14:00",
                        roles: [
                            {
                                type: "Chef",
                                amount: 1
                            },
                            {
                                type: "Waiter",
                                amount: 3
                            }
                        ]
                    },
                    {
                        start: "14:00",
                        end: "20:00",
                        roles: [
                            {
                                type: "Chef",
                                amount: 1
                            },
                            {
                                type: "Waiter",
                                amount: 3
                            }
                        ]
                    }
                ]
            }
        },
    ]
    }
    const [step, setStep] = useState(0);
    const [finish, setFinished] = useState(false);
    const [messages, setMessages] = useState<{from: string, msg: string, loading: boolean, id: string}[]>([])
    const [waiting, setWaiting] = useState(true);
    useEffect(() => {
        (async () => {
            const response = await waitForAi("");
        })();
    }, [])
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            roles: [],
            locations: ["london"],
            locationData: {
                
            }
        },
    });

    const onStep = () => {
        if(step == 2) {
            props.onFinish?.();
            return;
        }
        setStep(e => e + 1)
    }

    const onSubmitQuestion = async (question: string) => {
        return new Promise<string>(res => {
            setTimeout(() => res("Let's get started on creating a good schedule for your business. What is the name of your business?"), 2000);
        })
    }

    const waitForAi = async (question: string) => {
        setMessages(msgs => {
            msgs.push({from: "ai", msg: "", loading: true, id: randomId()});
            return [...msgs];
        })
        const response = await onSubmitQuestion(question);
        setWaiting(false)
        setMessages(msgs => {
            msgs[msgs.length - 1].msg = response
            msgs[msgs.length - 1].loading = false;
            return [...msgs];
        })
    }

    const onSubmitMessage = (e: any) => {
        if(e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            const val = e.target.value;
            setWaiting(true)
            setMessages(msgs => {
                msgs.push({from: "user", msg: val, loading: false, id: randomId()});
                return [...msgs];
            })
            setTimeout(async () => {
                await waitForAi(val);
                if(messages.length > 3) {
                    setFinished(true);
                }
            }, 200)
            e.target.value = "";
        }
    }
    if(step == 1) {
        return <Container size="md" top={0} mb={220}>
                    <Button mt={"md"} variant="light" onClick={() => setStep(0)}>Back to chat</Button>
                    <Stack mt={"md"} gap={"md"}>
                        {mockData.locations.map(loc => { 
                            const labels = ['Mon', "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                                return {
                                    value: day,
                                    label: (
                                        <Center style={{ gap: 10 }}>
                                            {(loc as any)[day.toLocaleLowerCase()] ? <IconCheck style={{ width: rem(16), height: rem(16) }} /> : <></>}
                                            <span>{day}</span>
                                        </Center>
                                    )
                                }
                            })
                            return (
                                <Paper withBorder p={"md"}>
                                    <Group mb={"md"} align="center" gap={"sm"}>
                                        <Text>{loc.name}</Text>
                                            <ActionIcon variant="light" size={rem(22)}><IconEdit /></ActionIcon>
                                        </Group>
                                    <SegmentedControl mb={"sm"} fullWidth data={labels} />
                                    <Switch mb={"sm"} label="Open" />
                                    <Input.Wrapper label="Shifts">
                                        <Accordion mt={"md"} variant="separated">
                                        {loc["mon"].shifts.map((shift,i) => {
                                            return <Accordion.Item value={i.toString()}>
                                            <Accordion.Control>{shift.start}-{shift.end}</Accordion.Control>
                                            <Accordion.Panel>
                                                <Stack>
                                                    {shift.roles.map(role => {
                                                        return <Paper withBorder p={"sm"}>
                                                            <Group>
                                                                <TextInput label="Role" defaultValue={role.type} />
                                                                <NumberInput label="Employees needed" defaultValue={role.amount} />
                                                            </Group>
                                                        </Paper>
                                                    })}
                                                </Stack>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                        })}
                                        </Accordion>       
                                    </Input.Wrapper> 
                                    <Group mt={"md"} w="100%" justify="end">
                                        <Button bg={"red"}>Remove location</Button>
                                    </Group>
                                </Paper>
                            )
                        })}
                    </Stack>
            </Container>
    }
    return <>
    <Container size="sm" top={0} mb={220}>
        <Title c={"#222222"} mb={0} ta={"center"} fw={500} mt={rem(50)}>Welcome to <strong>Scheduler!</strong></Title>
        <Title order={6} opacity={0.8} ta={"center"} mt={"xs"}>To get started, answer the following questions from our AI assistent to setup your business!</Title>
        <Stack mt={rem(50)} flex={1} gap={"sm"}>
            {messages.map(msg => {
                const fromUser = msg.from == "user";
                return <Group key={msg.id} justify={fromUser ? "end" : "start"}>
                <Paper className="chat-bubble" bg={fromUser ? "green" : undefined} radius={"xl"} withBorder={!fromUser} maw={rem(420)} py={"sm"} px={"xl"}>
                    <Text c={fromUser ? "white" : undefined} size={"sm"}>{msg.msg}</Text>
                    {msg.loading && <Loader color="green" size="xs" type="dots" />}
                </Paper>
            </Group>
            })}
            {finish && <Button className="chat-bubble" radius={"xl"} onClick={() => setStep(1)}>View schedule and submit</Button>}
        </Stack>
    </Container>
    <Container style={{zIndex: 2}} pos={"fixed"} mx={"auto"} bottom={0} mb={16} left={0} right={0} size="sm">
        <Textarea disabled={waiting} onKeyDown={onSubmitMessage} autosize radius={"xl"} className="chat-onboarding" placeholder={waiting ? "Waiting for response from ai...": "Write your answer here!"} />
    </Container>
  </>
    /*
    return <Center mih={"100vh"} w={"100vw"}>
        <Paper w={"100%"} maw={rem(1000)} withBorder>
            <Flex>
                <Flex direction={"column"} flex={1} p={rem(30)} justify="space-between">
                    <Stack flex={1}>
                        {step == 0 && <Welcome />}
                        {step == 1 && <Step2 form={form} />}
                        {step == 2 && <Step3 form={form} />}
                    </Stack>
                    <Group justify="space-between" w={"100%"}>
                        <Button variant="outline" onClick={() => setStep(e => Math.max(0, e - 1))}>Previous</Button>
                        <Button onClick={onStep}>{step == 2 ? "Finish" : "Next"}</Button>
                    </Group>
                </Flex>
                <Stack w={rem(250)} bg={"#F7FBFF"} p={"xl"}>
                    <Center>
                        <Stepper iconSize={28} size="sm" radius={"sm"} active={step} onStepClick={(e) => {setStep(e)}} orientation="vertical">
                            <Stepper.Step label="Welcome" description="" />
                            <Stepper.Step label="Business information" description="Basic information" />
                            <Stepper.Step label="Business Schedule" description="Scheduling" />
                            <Stepper.Step label="Done!" description="Get full access" />
                        </Stepper>
                    </Center>
                </Stack>
            </Flex>
        </Paper>
    </Center>
    */
}


import { Button, Box, Image, Center, Text, Flex, Group, Paper, rem, Stack, Title, TextInput, Stepper, TagsInput, Accordion, Divider, RangeSlider, NumberInput, SegmentedControl, Table, Checkbox, UnstyledButton, Container, Textarea, Loader, Switch, Tabs, Input, ActionIcon, Modal, MultiSelect } from "@mantine/core";
import { WrapperProps } from "../Wrapper/Wrapper";
import { useEffect, useRef, useState } from "react";
import { DateTimePicker, TimeInput } from '@mantine/dates';
import { useForm, UseFormReturnType } from '@mantine/form';
import { randomId, useDisclosure } from "@mantine/hooks";
import React from "react";
import "./index.css";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { CHAT_ONBOARD_ADD, CHAT_ONBOARD_FINISH, ITEMS, ITEMS_CREATE } from "../../graphql/items";
import { useQuery, useMutation } from '@apollo/client'
import { userInfo } from "os";
import Markdown from 'react-markdown'
import config from '../../config';
import { find } from "../../utils/util";
import { dayNumToKey } from "../pages/Schedule";
import { IconKey } from '@tabler/icons-react';

interface OnboardInfo {
        business: {
            name: string
        },
        locations: {
            id: string,
            name: string,
            address: string
        }[],
        locationRoles: {
            location_id: string,
            role_id: string
        }[],
        locationOpeningHours: {
            location_id: string,
            day_of_week:number,
            open_time: string,
            close_time: string
        }[],
        roles: {
            name: string,
            description: string,
            id: string
        }[],
        staffRequirements: {
            id: string,
            shift_id: string,
            role_id: string,
            employees_required: number
        }[],
        shifts: {
            id: string
            shift_id: string,
            shift_name: string,
            location_id: string,
            start_time: string,
            end_time: string,
            date: string
        }[]
}

export default function Onboarding(props: WrapperProps) {
    const [onboardData, setOnboardData] = useState<OnboardInfo|null>(null);
    const [page, setPage] = useState(0);
    const [finish, setFinished] = useState(false);
    const [messages, setMessages] = useState<{from: string, msg: string, error?: string, loading: boolean, id: string}[]>([])
    const [waiting, setWaiting] = useState(true);
    const [opened, { open, close }] = useDisclosure(false);
    const [onboardFinishFn, {data, loading,error}] = useMutation(CHAT_ONBOARD_FINISH);
    const ref = useRef<any>();
    useEffect(() => {
        (async () => {
         await waitForAi("Hello my name is " + props.userInfo.given_name + " how can you help me?")
        })()
    }, [])

    const splitMessages = () => {
        let chatbot = messages.filter(msg => msg.from == "ai").filter(v => !v.loading && !v.error).map(msg => msg.msg);
        let human = messages.filter(msg => msg.from != "ai").filter(v => !v.loading && !v.error).map(msg => msg.msg);
        return [chatbot, human]
    }

    const onSubmitQuestion = async (question: string) => {
        return new Promise<any>(async (res: any, err: any) => {
            let [chatbot, human] = splitMessages();
            human.push(question);
            let response = await fetch(config.api_base_url + "/chat", {
                method: "POST",
                body: JSON.stringify({chatbot, human}),
                headers: {
                    "Content-Type": "application/json",
                    "x-curity-csrf": props.csrf ?? ""
                },
                credentials: "include"
            }).then(res => {
                if(res.ok) {
                    return res.json()
                }
                return null;
            }).catch(e => null);
            //let response = await addQuestion({ variables: { human: human, chatbot: ai } })
            if(!response) {
                return err("I could not help you at the moment, please try again later!");
            }
            res(response);
        })
    }

    const onOnboard = async () => {
        setLoading(true);
        let [chatbot, human] = splitMessages();
        let response = await onboardFinishFn({variables: {chatbot, human, summary: chatbot[chatbot.length - 1]}})
        console.log("RESPONSE FINISH", response);
        setOnboardData(response.data.convertSummaryToJsonAndPopulateDb.jsonOutput);
        open();
        setLoading(false);
    }

    const waitForAi = async (question: string) => {
        setMessages(msgs => {
            msgs.push({from: "ai", msg: "", loading: true, id: randomId()});
            return [...msgs];
        })
        try  {
            const response = await onSubmitQuestion(question);
            if(response.stop_chat) {
                setFinished(true)
            }
            setMessages(msgs => {
                msgs[msgs.length - 1].msg = response.response
                msgs[msgs.length - 1].loading = false;
                return [...msgs];
            })
        } catch(err: any) {
            setMessages(msgs => {
                msgs[msgs.length - 1].msg = err
                msgs[msgs.length - 1].loading = false;
                msgs[msgs.length - 1].error = "error";
                return [...msgs];
            })
        } finally {
            setWaiting(false)
        }
    }

    const onSubmitMessage = (e: any) => {
        if(e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            
            if(finish) {
                setFinished(false)
            }
            const val = e.target.value;
            setWaiting(true)
            setMessages(msgs => {
                msgs.push({from: "user", msg: val, loading: false, id: randomId()});
                return [...msgs];
            })
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 20)
            setTimeout(async () => {
                await waitForAi(val);
                console.log("red", ref.current)
                setTimeout(() =>  {
                    e.target.focus()
                    window.scrollTo(0, document.body.scrollHeight);
                }, 100)
            }, 200)
            e.target.value = "";
        }
    }

    const parseMessage = (msg: string, color: string|undefined) => {
        let md = getMd(msg);
        return <>
            <Markdown>{md}</Markdown>
        </>
    }
    const [loaderBtn, setLoading] = useState(false);

    const getMd = (msg: string) => {
        if(msg.indexOf("```") < 0) return msg;
        if(msg.indexOf("```markdown") >= 0) return msg.replace("```markdown","").replace("```", "")
        if(msg.indexOf("```") >= 0) return msg.replace("```","").replace("```", "")
    }
    
    if(page == 0) {
        return <Box p="0" w={"100vw"} h={"100vh"} pos="absolute" top="0" left="0">
            <Group style={{zIndex: 11}} pos="fixed" right="2rem" top="2rem">
                <Button c="white" variant="subtle" leftSection={<IconKey />} onClick={() => setPage(1)}>Begin Smart Onboarding</Button>
            </Group>
            <Center pos="absolute" style={{zIndex: 10}} w="100%" h="100%">
                <Title style={{fontSize: "3.5rem"}} c="white">Scheduling has never been easier!</Title>
            </Center>
            <Image fit="cover" top="0" left="0" w="100%" h="100%" src="/hack2.jpg" pos="absolute" />
        </Box>
    }

    return <>
    <Group style={{zIndex: 11}} pos="fixed" right="2rem" top="2rem">
        <Button variant="subtle" onClick={() => setPage(0)}>Back To Mainpage</Button>
    </Group>
    <Modal size={"xl"} title="Validate business information" opened={opened} onClose={close}>
        {onboardData && <>
                <TextInput mb="sm" label="Name" value={onboardData.business.name} />
                <Accordion variant="separated">
                    {onboardData.locations.map(loc => {
                        return <Accordion.Item value={loc.id} key={"loc:"+loc.id}>
                            <Accordion.Control>{loc.name} {loc.address}</Accordion.Control>
                            <Accordion.Panel>
                                <TextInput mb={"sm"} label="Name" value={loc.name} />
                                <TextInput mb={"sm"} label="Address" value={loc.address} />
                                <Accordion variant="separated">
                                    {[1,2,3,4,5,6,7].map(dayId => {
                                        const openingHours = onboardData.locationOpeningHours.find(v => v.day_of_week == dayId && v.location_id == loc.id);
                                        if(!openingHours) {
                                            return <Accordion.Item value="-1">
                                                 <Accordion.Control>{dayNumToKey[dayId]} (Closed)</Accordion.Control>
                                                 <Accordion.Panel>
                                                    <Button>Add this day</Button>
                                                 </Accordion.Panel>
                                            </Accordion.Item>
                                        }
                                        const roles = onboardData.locationRoles.filter(r => r.location_id == loc.id).map(r => {
                                            return onboardData.roles.find(v => v.id == r.role_id)
                                        })
                                        const shifts = onboardData.shifts.filter(s => s.location_id == loc.id);
                                        const todaysShifts = shifts.filter(s => new Date(s.date).getDay() == dayId);

                                        return <Accordion.Item value={dayId+"day"} key={"day" + dayId}>
                                            <Accordion.Control>{dayNumToKey[dayId]} (Open)</Accordion.Control>
                                            <Accordion.Panel>
                                                <Group mb={"sm"} grow>
                                                    <TextInput label="Open" value={openingHours?.open_time} />
                                                    <TextInput label="Close" value={openingHours?.close_time} />
                                                </Group>
                                                <Accordion variant="separated"></Accordion>
                                                {todaysShifts.map(ts => {
                                                    return <Accordion.Item value={"shiftId: " + ts.shift_id + loc.id + dayId}>
                                                            <Accordion.Control>{ts.start_time} - {ts.end_time}</Accordion.Control>
                                                            <Accordion.Panel>
                                                                <Stack gap={"sm"}>
                                                                    {roles.map(r => {
                                                                        const requirement = onboardData.staffRequirements.find(re => re.role_id == r?.id && re.id == ts.id);
                                                                        return <Group grow>
                                                                            <TextInput label="Role" value={r?.name} />
                                                                            <NumberInput label="Amount Needed" value={requirement?.employees_required} />
                                                                        </Group>
                                                                    })}
                                                                    
                                                                </Stack>
                                                            </Accordion.Panel>
                                                    </Accordion.Item>
                                                })}
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    })}
                                </Accordion>
                            </Accordion.Panel>
                        </Accordion.Item>
                    })}
                </Accordion>
                <Button mt="sm" loading={loading} onClick={() => {
                    setLoading(true); 
                    setTimeout(() => props?.onFinish?.(), 1000)
                }}>Save Changes</Button>
        </>}
    </Modal>
    <Container size="sm" top={0} mb={120}>
        <Title c={"#222222"} mb={0} ta={"center"} fw={500} mt={rem(50)}>Welcome to <strong>Smart Onboarding</strong></Title>
        <Title order={6} opacity={0.8} ta={"center"} mt={"xs"}>To get started, answer the following questions from our AI assistent to setup your business!</Title>
        <Stack mt={rem(50)} flex={1} gap={"sm"}>
            {messages.map(msg => {
                const fromUser = msg.from == "user";
                return <Group key={msg.id} justify={fromUser ? "end" : "start"}>
                <Paper style={{color: fromUser ? "white" : undefined}} className="chat-bubble" bg={fromUser ? "green" : undefined} radius={"xl"} withBorder={!fromUser} maw={rem(420)} py={"sm"} px={"lg"}>
                    {msg.msg && parseMessage(msg.msg, fromUser ? "white" : undefined)}
                    {msg.loading && <Loader color="green" size="xs" type="dots" />}
                </Paper>
            </Group>
            })}
            {finish && <Button loading={loaderBtn} className="chat-bubble" radius={"xl"} onClick={onOnboard}>Validate summary!</Button>}
        </Stack>
    </Container>
    <Container style={{zIndex: 2}} pos={"fixed"} mx={"auto"} bottom={0} mb={16} left={0} right={0} size="sm">
        <Textarea ref={ref} disabled={waiting} onKeyDown={onSubmitMessage} autosize radius={"xl"} className="chat-onboarding" placeholder={waiting ? "Waiting for response from ai...": "Write your answer here!"} />
    </Container>
    </>
}


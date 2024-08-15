import { Button, Center, Text, Flex, Group, Paper, rem, Stack, Title, TextInput, Stepper, TagsInput, Accordion, Divider, RangeSlider, NumberInput, SegmentedControl, Table, Checkbox, UnstyledButton, Container, Textarea, Loader, Switch, Tabs, Input, ActionIcon, Modal } from "@mantine/core";
import { WrapperProps } from "../Wrapper/Wrapper";
import { useEffect, useRef, useState } from "react";
import { TimeInput } from '@mantine/dates';
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

export default function Onboarding(props: WrapperProps) {
    const [step, setStep] = useState(0);
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

    const waitForAi = async (question: string) => {
        setMessages(msgs => {
            msgs.push({from: "ai", msg: "", loading: true, id: randomId()});
            return [...msgs];
        })
        try  {
            const response = await onSubmitQuestion(question);
            if(response.stop_chat) {
                setFinished(true)
                open()
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
        if(!msg.includes("```markdown")) {
            return <Text c={color} size={"sm"}>{msg}</Text>
        }
        let preMessage = msg.substring(0, msg.indexOf("```markdown"));
        let postMessage = msg.substring(msg.lastIndexOf("```")+3, msg.length);
        let md = getMd(msg);
        return <>
            <Text c={color} size={"sm"}>{preMessage}</Text>
            <Markdown>{md}</Markdown>
            <Text c={color} size={"sm"}>{postMessage}</Text>
        </>
    }

    const onAccept = async () => {
        let [chatbot, human] = splitMessages();
        let summarys = chatbot.filter(v => v.includes("```markdown"));
        let summary = getMd(summarys[summarys.length - 1]);
        let response = await onboardFinishFn({variables: {chatbot, human, summary}})
        if(response.data) {
            props.onFinish?.();
        }
    }

    const getMd = (msg: string) => {
        return msg.substring(
            msg.indexOf("```markdown") + 12, 
            msg.lastIndexOf("```")
        );
    }
    
    return <>
    <Container size="sm" top={0} mb={120}>
        <Title c={"#222222"} mb={0} ta={"center"} fw={500} mt={rem(50)}>Welcome to <strong>Scheduler</strong></Title>
        <Title order={6} opacity={0.8} ta={"center"} mt={"xs"}>To get started, answer the following questions from our AI assistent to setup your business!</Title>
        <Stack mt={rem(50)} flex={1} gap={"sm"}>
            {messages.map(msg => {
                const fromUser = msg.from == "user";
                return <Group key={msg.id} justify={fromUser ? "end" : "start"}>
                <Paper className="chat-bubble" bg={fromUser ? "green" : undefined} radius={"xl"} withBorder={!fromUser} maw={rem(420)} py={"sm"} px={"xl"}>
                    {msg.msg && parseMessage(msg.msg, fromUser ? "white" : undefined)}
                    {msg.loading && <Loader color="green" size="xs" type="dots" />}
                </Paper>
            </Group>
            })}
            {finish && <Button className="chat-bubble" radius={"xl"} onClick={onAccept}>Accept summary and finish onboarding!</Button>}
        </Stack>
    </Container>
    <Container style={{zIndex: 2}} pos={"fixed"} mx={"auto"} bottom={0} mb={16} left={0} right={0} size="sm">
        <Textarea ref={ref} disabled={waiting} onKeyDown={onSubmitMessage} autosize radius={"xl"} className="chat-onboarding" placeholder={waiting ? "Waiting for response from ai...": "Write your answer here!"} />
    </Container>
    </>
}


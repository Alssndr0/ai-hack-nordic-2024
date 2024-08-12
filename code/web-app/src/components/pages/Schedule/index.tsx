import { Center, Flex, Group, Paper, rem, Stack, Title, Text, Divider, Select, Box, Avatar, getGradient, useMantineTheme, ColorSwatch } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import "./index.css";
import { useEffect, useState } from "react";
import { stringToColour, stringToNumber, timetoMinutes } from "../../../utils/util";
import { IconAlertCircle, IconUxCircle, IconX } from "@tabler/icons-react";
function getMinMaxTime(week: any): [number, number, string, string] {
    let min = Number.MAX_VALUE;
    let max = 0;
    let minStr = "";
    let maxStr = "";
    Object.values(week).forEach((day: any) => {
        day.shifts.forEach((shift: any) => {
            const start = timetoMinutes(shift.start);
            const end = timetoMinutes(shift.end);
            if(start < min) {
                min = start;
                minStr = shift.start;
            }
            if(end > max) {
                max = end;
                maxStr = shift.end;
            }
        })
    })

    return [min, max, minStr, maxStr];
}

function getUniqueRoles(weekInfo: string) {
    const roles: string[] = [];
    Object.values(weekInfo).forEach((day: any) => {
        day.shifts.forEach((shift: any) => {
            shift.roles.forEach((role: any) => {
                if(!roles.includes(role.value)) {
                    roles.push(role.value)
                }
            })
        })
    })

    return roles;
}

export default function Schedule() {
    const allDays = [
        {label: "Monday", value: "mon"},
        {label: "Tuesday", value: "tue"},
        {label: "Wednesday", value: "wed"},
        {label: "Thursday", value: "thu"},
        {label: "Friday", value: "fri"},
        {label: "Saturday", value: "sat"},
        {label: "Sunday", value: "sun"},
    ]

    const colors = [
        "#F06418",
        "#2BDD66",
        "#00B5FF",
        "#5474B4",
        "#1F32C4",
        "#4F23C0",
        "#6B31B2",
        "#F01879",
        "#099CFF",
        "#D9D02F",
        "#63687C"
    ]

    const [weekInfo, setWeekInfo] = useState<any>({
        mon: {
            shifts: [
                {
                    start: "08:00",
                    end: "12:00",
                    roles: [
                        {
                            value: "Chef",
                            amount: 1,
                            expected: 2,
                        },
                        {
                            value: "Waiter",
                            amount: 3
                        }
                    ]
                },
                {
                    start: "12:00",
                    end: "19:00",
                    roles: [
                        {
                            value: "Chef",
                            amount: 2
                        },
                        {
                            value: "Waiter",
                            amount: 3
                        }
                    ]
                },
                {
                    start: "19:00",
                    end: "22:00",
                    roles: [
                        {
                            value: "Chef",
                            amount: 2
                        },
                        {
                            value: "Waiter",
                            amount: 2
                        }
                    ]
                }
            ]
        },
        wed: {
            shifts: [
                {
                    start: "07:00",
                    end: "11:00",
                    roles: [
                        {
                            value: "Chef",
                            amount: 1,
                            expected: 1,
                        },
                        {
                            value: "Waiter",
                            amount: 3,
                            expected: 3,
                        }
                    ]
                },
                {
                    start: "11:00",
                    end: "20:00",
                    roles: [
                        {
                            value: "Chef",
                            amount: 2,
                            expected: 2,
                        },
                        {
                            value: "Waiter",
                            amount: 3,
                            expected: 3,
                        }
                    ]
                },
                {
                    start: "20:00",
                    end: "23:30",
                    roles: [
                        {
                            value: "Chef",
                            amount: 2,
                            expected: 3,
                        },
                        {
                            value: "Waiter",
                            amount: 2,
                            expected: 2,
                        }
                    ]
                }
            ]
        }
    })

    const [roleColors, setRoleColors] = useState<any>([]);

    useEffect(() => {
        const roles = getUniqueRoles(weekInfo).sort();
        const roleCols: any = {}
        let index = 0;
        for(const role of roles) {
            let ogIndex = index;
            let color = "";
            if(index >= colors.length) {
                color = stringToColour(role);
            } else {
                color = colors[index];
            }
            index ++;

            roleCols[role] = color;
        }
        console.log(roles, roleCols);
        setRoleColors(roleCols);
    }, [weekInfo])

    const onSelectDayDisplayType = (val: string|null) => {
        if(val == "all") {
            setActiveDays(allDays)
        } else if(val == "mf") {
            setActiveDays(allDays.filter(v => ["mon", "tue", "wed", "thu", "fri"].includes(v.value)))
        } else if(val == "work") {
            setActiveDays(allDays.filter(v => Object.keys(weekInfo).includes(v.value)))
        }
    }

    const [activeDays, setActiveDays] = useState(allDays)
    const theme = useMantineTheme();
    const [smallestTime, largestTime, smallestTimeStr, largestTimeStr] = getMinMaxTime(weekInfo);
    const dayLength = largestTime - smallestTime;
    console.log(smallestTime, largestTime, dayLength);
    return <Flex w={"100%"} h={"100vh"} py={"lg"} gap={"md"}>
        <Flex direction="column" w={rem(300)} gap={"md"}>
            <Paper radius={"md"} py={"md"} withBorder w={"100%"} mih={rem(300)}>
                <Center>
                    <Calendar />
                </Center>
            </Paper>
            <Paper p={"md"} radius={"md"} withBorder w={"100%"} flex={1}>
                <Stack gap={"sm"}>
                    <Title order={6} opacity={0.6}>Roles needed this week</Title>
                    {Object.keys(roleColors).map(key => (
                        <Group gap={"sm"}>
                            <ColorSwatch color={roleColors[key]} withShadow /><Text>{key}</Text>
                        </Group>
                    ))}
                    <Divider />
                    <Title order={6} opacity={0.6}>Employees working this week</Title>
                    <Group>
                        <Avatar />
                        <Text>Steve carell</Text>
                    </Group>
                    <Group>
                        <Avatar />
                        <Text>Leslie Knope</Text>
                    </Group>
                </Stack>
            </Paper>
        </Flex>
        <Flex direction={"column"} flex={1} gap={"md"}>
            <Paper radius={"md"} p={"md"} withBorder>
                <Select onChange={onSelectDayDisplayType} data={[
                    {label: "All days", value: "all"},
                    {label: "Work days", value: "work"},
                    {label: "Mon-Fri", value: "mf"}
                ]} />
            </Paper>
            <Paper radius={"md"} flex={1} p={"md"} withBorder>
                <Flex gap={"xs"} h={"100%"} direction={"column"} justify={"stretch"}>
                    <Stack gap={0} mb={"md"}>
                        <Title order={2} opacity={0.9}>Week 23</Title>
                        <Title order={6} opacity={0.6}>Dec 23 - Dec 31</Title>
                    </Stack>
                    <Flex gap={"sm"} align={"center"} justify={"stretch"} h={rem(14)} w={"100%"}>
                        {activeDays.map(ad => <Text key={ad.value} ta={"center"}  flex={1}>{ad.label}</Text>)}
                    </Flex>
                    <Flex flex={1} gap={"sm"} justify={"stretch"} h={"100%"} w={"100%"}>
                        {activeDays.map(ad => {
                            const info = weekInfo[ad.value];
                            if(!info) {
                                return <Stack flex={1}>
                                    <Paper opacity={0.8} withBorder radius={"md"} w={"100%"} h={"100%"} style={{overflow: "hidden"}}>
                                        <Flex align={"stretch"} h={"100%"} w={"100%"}>
                                            <Flex gap={"xs"} direction={"column"} w={"1.6rem"} p={"xs"} align={"center"}>
                                                <Text className="time" opacity={0.7}>{smallestTimeStr}</Text>
                                                <Divider orientation="vertical" flex={1} />
                                                <Text className="time" opacity={0.7}>{largestTimeStr}</Text>
                                            </Flex>
                                            <Flex flex={"1"} w={"2rem"} align={"stretch"}>
                                                <Center flex={"1"}>
                                                    <Title opacity={0.6} order={3} className="time">Closed</Title>
                                                </Center>
                                            </Flex>
                                        </Flex>
                                    </Paper>
                                </Stack>
                            }
                            return <Stack pos={"relative"} flex={1} gap={"1%"}>
                                {info.shifts.map((shift: any, i: number) => {
                                    const start = timetoMinutes(shift.start);
                                    const end = timetoMinutes(shift.end);
                                    const lengthMin = end-start;
                                    const startPercent = ((start - smallestTime) / dayLength) + (i == 0 ? 0 : 0.01);
                                    const lengthPercent = (lengthMin / dayLength) - (i == info.shifts.left -1 ? 0 : 0.01);
                                    return (
                                    <Paper pos={"absolute"} top={`${startPercent*100}%`} withBorder radius={"md"} w={"100%"} h={`${lengthPercent * 100}%`} style={{overflow: "hidden"}}>
                                        <Flex align={"stretch"} h={"100%"} w={"100%"}>
                                            <Flex gap={"xs"} direction={"column"} w={"1.6rem"} p={"xs"} align={"center"}>
                                                <Text className="time" opacity={0.7}>{shift.start}</Text>
                                                <Divider orientation="vertical" flex={1} />
                                                <Text className="time" opacity={0.7}>{shift.end}</Text>
                                            </Flex>
                                            <Flex flex={"1"} w={"2rem"} align={"stretch"}>
                                                {shift.roles.map((role: any) => {
                                                    const grad = roleColors[role.value];
                                                    return <>
                                                        <Flex direction={"column"} align="strech" flex={"1"}>
                                                            {Array(role.expected).fill(0).map((num: any, i: number) => {
                                                                return <>
                                                                    <Group bg={i >= role.amount ? "red" : grad} flex={1}>
                                                                        {i >= role.amount && <Center w={"100%"}>
                                                                            <IconAlertCircle color="white" />
                                                                        </Center>}
                                                                    </Group>
                                                                    {i != role.expected-1 && <Divider />}
                                                                </>
                                                            })}
                                                        </Flex>
                                                        {i != shift.roles.length && <Divider orientation="vertical" />}
                                                    </>;
                                                })}
                                            </Flex>
                                        </Flex>
                                    </Paper>
                                    )
                                })}
                        </Stack>
                        })}
                    </Flex>
                </Flex>
            </Paper>
        </Flex>
    </Flex>
}
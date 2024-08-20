import { Center, Flex, Group, Paper, rem, Stack, Title, Text, Divider, Select, Box, Avatar, getGradient, useMantineTheme, ColorSwatch, Tooltip, Skeleton, Button, Modal, Rating } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import "./index.css";
import { useEffect, useState } from "react";
import { getWeek, stringToColour, stringToNumber, timetoMinutes } from "../../../utils/util";
import { IconAlertCircle, IconCalendar, IconThumbDown, IconThumbUp, IconUxCircle, IconX } from "@tabler/icons-react";
import dayjs from 'dayjs';
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_SCHEDULE, QUERY_LOCATIONS, SCHEDULE_QUERY, SCHEDULE_TEMPLATE_QUERY } from "../../../graphql/items";
import React from "react";

const getIconStyle = (color?: string) => ({
    width: rem(24),
    height: rem(24),
    color: color ? `var(--mantine-color-${color}-7)` : undefined,
  });
  
  const getEmptyIcon = (value: number) => {
    const iconStyle = getIconStyle();
  
    switch (value) {
      case 1:
        return <IconThumbUp style={iconStyle} />;
      case 2:
        return <IconThumbDown style={iconStyle} />;
    }
  };
  
  const getFullIcon = (value: number) => {
    switch (value) {
      case 1:
        return <IconThumbUp style={getIconStyle('blue')} />;
      case 2:
        return <IconThumbDown style={getIconStyle('red')} />;
    }
  };

function getDay(date: Date) {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  }
  
  function startOfWeek(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - getDay(date) - 1);
  }
  
  function endOfWeek(date: Date) {
    return dayjs(new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - getDay(date))))
      .endOf('date')
      .toDate();
  }
  
  function isInWeekRange(date: Date, value: Date | null) {
    return value
      ? dayjs(date).isBefore(endOfWeek(value)) && dayjs(date).isAfter(startOfWeek(value))
      : false;
  }

function getMinMaxTime(week: any): [number, number, string, string] {
    if(!week) return [-1, -1, "", ""]
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


export const dayNumToKey: Record<number, string> = {
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
    0: "sun",
}


const createSchedule = (template: any, weekData: any[]) => {
    weekData.forEach(employeeShift => {
        const dayName = dayNumToKey[new Date(employeeShift.date).getDay()];
        if(!template[dayName]) return
        const endTime =  employeeShift.endTime == "00:00" ? "24:00" : employeeShift.endTime
        const shift = template[dayName].shifts.find((o: any) => o.start == employeeShift.startTime && o.end == endTime);
        if(!shift) return;
        const role = shift.roles.find((r: any) => r.value == employeeShift.roleName);
        if(!role) return;
        role.amount ++;
        role.employees.push({firstName: employeeShift.firstName, lastName: employeeShift.lastName})
    });
    return template;
}

const createTemplateStructure = (template: any) => {
    const obj: any = {};
    template.forEach((shift: any) => {
        const day = dayNumToKey[shift.dayOfWeek];

        let dayObj = obj[day]
        if(!dayObj) {
            dayObj = {shifts: []};
            obj[day] = dayObj;
        }
        
        let shiftObj = dayObj.shifts.find((o: any) => o.start == shift.startTime && o.end == shift.endTime);
        if(!shiftObj) {
            shiftObj = {
                start: shift.startTime,
                end: shift.endTime == "00:00" ? "24:00" : shift.endTime,
                roles: []
            };
            dayObj.shifts.push(shiftObj)
        }
        let roleObj = shiftObj.roles.find((o: any) => o.value == shift.roleName);
        if(!roleObj) {
            roleObj = {
                value: shift.roleName,
                employees: [],
                expected: parseInt(shift.employeesRequired),
                amount: 0
            }
            shiftObj.roles.push(roleObj);
        } else {
            //throw Error("Role already exist in template!")
        }
    })

    return obj;
}

const getAllUniqueEmployees = (schedule: any) => {
    const members: string[] = [];
    Object.values(schedule).forEach((day: any) => {
        day.shifts.forEach((shift: any) => {
            shift.roles.forEach((role: any) => {
                role.employees.forEach((employee: any) => members.push(employee.firstName + " " + employee.lastName));
            })
        })
    })

    return members.filter((value, index, array) => array.indexOf(value) === index);
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

    const {loading, error, data: templateData} = useQuery(SCHEDULE_TEMPLATE_QUERY)

    const [weekInfo, setWeekInfo] = useState<any>(null)

    const [roleColors, setRoleColors] = useState<any>([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [week, setWeek] = useState<Date>(new Date());
    const [schedData, setSchedData] = useState<any>(null);
    const {loading: loadingSched, error: errorSched, data: scheduleData, refetch} = useQuery(SCHEDULE_QUERY, {variables:{year: new Date().getFullYear(), week: getWeek(week)}})
    const {loading: loadingLoc, error: errorLoc, data: locations} = useQuery(QUERY_LOCATIONS, {variables:{year: new Date().getFullYear(), week: getWeek(week)}})
    useEffect(() => {
        setSchedData(scheduleData)
    }, [scheduleData])
    useEffect(() => {
        if(locations) {
            setSelectedLocation(locations.locations?.[0]?.id ?? null)
        }
    }, [locations])
    const [createScheduleMut] = useMutation(CREATE_SCHEDULE)
    const [weekGenerated, setWeekGenerated] = useState(true);
    useEffect(() => {
        if(!templateData || !schedData || loading) return;
        const obj = createTemplateStructure(templateData.scheduleTemplate);
        const filledObj = createSchedule(obj, schedData.getSchedulesByWeek); 
        if(schedData.getSchedulesByWeek.length == 0) {
            setWeekGenerated(false);
        }
        console.log("DATA", obj, filledObj);
        setWeekInfo(filledObj); 
    }, [templateData, schedData, loadingSched])
    
    useEffect(() => {
        if(!weekInfo) return;
        const roles = getUniqueRoles(weekInfo).sort();
        const roleCols: any = {}
        let index = 0;
        for(const role of roles) {
            let color = "";
            if(index >= colors.length) {
                color = stringToColour(role);
            } else {
                color = colors[index];
            }
            index ++;

            roleCols[role] = color;
        }
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

    const onGenerateSchedule = async () => {
        setWeekInfo(null);
        await createScheduleMut();
        const {data} = await refetch();
        console.log("refetch", data)
        setSchedData({...data});
    }

    const [activeDays, setActiveDays] = useState(allDays)
    const theme = useMantineTheme();
    return <Flex w={"100%"} h={"100vh"} py={"lg"} gap={"md"}>
        <Flex direction="column" w={rem(300)} gap={"md"}>
            <Paper radius={"md"} py={"md"} withBorder w={"100%"} mih={rem(300)}>
                <Center>
                    <Calendar
                        withCellSpacing={false}
                        getDayProps={(date) => {
                          const isHovered = isInWeekRange(date, hovered);
                          const isSelected = isInWeekRange(date, week);
                          const isInRange = isHovered || isSelected;
                          return {
                            onMouseEnter: () => setHovered(date),
                            onMouseLeave: () => setHovered(null),
                            inRange: isInRange,
                            firstInRange: isInRange && date.getDay() === 1,
                            lastInRange: isInRange && date.getDay() === 0,
                            selected: isSelected,
                            onClick: () => setWeek(date),
                          };
                        }}
                    />
                </Center>
            </Paper>
            <Paper p={"md"} radius={"md"} withBorder w={"100%"} flex={1}>
                <Stack gap={"sm"}>
                    <Title order={6} opacity={0.6}>Roles needed this week</Title>
                    {!weekInfo && <Skeleton mih={rem(40)} visible={true} />}
                    {weekInfo && Object.keys(roleColors).map(key => (
                        <Group gap={"sm"}>
                            <ColorSwatch color={roleColors[key]} withShadow /><Text>{key}</Text>
                        </Group>
                    ))}
                    <Divider />
                    <Title order={6} opacity={0.6}>Employees working this week</Title>
                    {!weekInfo && <Skeleton mih={rem(40)} visible={true} />}
                    {weekInfo && getAllUniqueEmployees(weekInfo).map(employee => <Group>
                            <Avatar />
                            <Text>{employee}</Text>
                        </Group>)
                    }
                </Stack>
            </Paper>
        </Flex>
        <Flex direction={"column"} flex={1} gap={"md"}>
            <Paper radius={"md"} p={"md"} withBorder>
                <Group>
                    <Select label={"Display days"} onChange={onSelectDayDisplayType} data={[
                        {label: "All days", value: "all"},
                        {label: "Work days", value: "work"},
                        {label: "Mon-Fri", value: "mf"}
                    ]} />
                    <Select label={"Location"} value={selectedLocation} onChange={onSelectDayDisplayType} data={
                        locations?.locations?.map((loc: any) => ({label: loc.name, value: loc.id})) ?? []} />
                </Group>
            </Paper>
            <Paper radius={"md"} flex={1} p={"md"} withBorder>
                <Flex gap={"xs"} h={"100%"} direction={"column"} justify={"stretch"}>
                    <Group align="center" justify="space-between" w={"100%"}>
                        <Stack gap={0} mb={"md"}>
                            <Title order={2} opacity={0.9}>Week {week ? getWeek(week) : ""} {!weekGenerated  && "(Not Generated)"}</Title>
                            <Title order={6} opacity={0.6}>Dec 23 - Dec 31</Title>
                        </Stack>
                        <Button onClick={onGenerateSchedule} leftSection={<IconCalendar />}>{weekGenerated ? "Regenerate Schedule" : "Generate Schedule"}</Button>
                    </Group>
                    <Flex gap={"sm"} align={"center"} justify={"stretch"} h={rem(14)} w={"100%"}>
                        {activeDays.map(ad => <Text key={ad.value} ta={"center"}  flex={1}>{ad.label}</Text>)}
                    </Flex>
                    <Flex flex={1} gap={"sm"} justify={"stretch"} h={"100%"} w={"100%"}>
                        {(!weekInfo) && <Skeleton visible={true}/>}
                        <ScheduleData roleColors={roleColors} weekGenerated={weekGenerated} weekInfo={weekInfo} activeDays={activeDays} />
                    </Flex>
                </Flex>
            </Paper>
        </Flex>
    </Flex>
}

const ScheduleData = ({weekInfo, activeDays, weekGenerated, roleColors}: any) => {
    const [shift, setShift] = useState<any>(null)
    const [smallestTime, largestTime, smallestTimeStr, largestTimeStr] = getMinMaxTime(weekInfo);
    const dayLength = largestTime - smallestTime;
    if(!weekInfo) return <></>;
    return activeDays.map((ad: any) => {
        const info = weekInfo[ad.value];
        if(!info) {
            return <Stack key={ad.value} flex={1}>
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
        return <>
        <Modal title={"Shift"} opened={!!shift} onClose={() => setShift(null)}>
            {shift && <>
            <Stack gap={"sm"}>
                <Text>{shift.employee.firstName + " " + shift.employee.lastName}</Text>
                <Rating count={2} emptySymbol={getEmptyIcon} fullSymbol={getFullIcon} highlightSelectedOnly />
            </Stack>
            </>}
        </Modal>
        <Stack pos={"relative"} flex={1} gap={"1%"}>
            {info.shifts.map((shift: any, i: number) => {
                const start = timetoMinutes(shift.start);
                const end = timetoMinutes(shift.end);
                const lengthMin = end-start;
                const startPercent = ((start - smallestTime) / dayLength);
                const lengthPercent = (lengthMin / dayLength);
                return (
                <Paper key={ad.value+shift.start+shift.end+i} pos={"absolute"} top={`${startPercent*100}%`} withBorder radius={"md"} w={"100%"} h={`${lengthPercent * 100}%`} style={{overflow: "hidden"}}>
                    <Flex align={"stretch"} h={"100%"} w={"100%"}>
                        <Flex gap={"xs"} direction={"column"} w={"1.6rem"} p={"xs"} align={"center"}>
                            <Text className="time" opacity={0.7}>{shift.start}</Text>
                            <Divider orientation="vertical" flex={1} />
                            <Text className="time" opacity={0.7}>{shift.end}</Text>
                        </Flex>
                        <Flex flex={"1"} w={"2rem"} align={"stretch"}>
                            {shift.roles.map((role: any, roleI: number) => {
                                if(!weekGenerated) {
                                    return <Box w={"100%"} h={"100%"} bg={"lightgray"} />
                                }
                                const grad = roleColors[role.value];
                                return <React.Fragment key={roleI+role.value+ad.value+shift.start+shift.end}>
                                    <Flex direction={"row"} align="strech" flex={"1"}>
                                        {Array(role.expected).fill(0).map((num: any, i: number) => {
                                            return <React.Fragment key={roleI+i+role.value+ad.value+shift.start+shift.end+i}>
                                                <Tooltip label={i >= role.amount ? role.value + " Needed" : role.employees[i].firstName + " " + role.employees[i].lastName}>
                                                    <Group style={{cursor: "pointer"}} onClick={() => setShift({shift, employee: role.employees[i], role: role.value})} bg={i >= role.amount ? "red" : grad} flex={1}>
                                                        {i >= role.amount && <Center w={"100%"}>
                                                            <IconAlertCircle color="white" />
                                                        </Center>}
                                                    </Group>
                                                </Tooltip>
                                                {i != role.expected-1 && <Divider orientation="vertical" />}
                                            </React.Fragment>
                                        })}
                                    </Flex>
                                    {i != shift.roles.length && <Divider orientation="vertical" />}
                                </React.Fragment>;
                            })}
                        </Flex>
                    </Flex>
                </Paper>
                )
            })}
    </Stack>
    </>
    })
}
import React, { useState, useEffect } from 'react'
import { AppShell, Text, Box, Burger, Button, Group, Paper, rem, ThemeIcon, Title, UnstyledButton, Stack, Avatar, Flex, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarStats, IconChevronRight, IconDoorExit, IconSettings, IconUsers } from '@tabler/icons-react';
import "./index.css";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
export interface WrapperProps {
    userInfo: any,
    logout: () => void;
    onFinish?: () => void;
    csrf?: string;
}

interface MenuItemProps {
    active: boolean,
    onClick: () => void,
    label: string,
    icon: any
}

const MenuItem = (props: MenuItemProps) => {
    const Icon = props.icon;
    const activeColorBg = "#cde2ff";
    const activeColor = "#004ecc";
    const opacity = props.active ? 1 : 0.7;
    return <UnstyledButton onClick={props.onClick} className={"menu-button"}>
        <Paper bg={props.active ? activeColorBg : "transparent"} radius={"xl"} p={"xs"} ps={"lg"} className={"menu-button-bg"}>
            <Group align='center'>
                <Icon opacity={opacity} style={{ color: props.active ? activeColor : undefined, width: rem(20), height: rem(20) }} />
                <Text fw={"600"} opacity={opacity}>{props.label}</Text>
            </Group>
        </Paper>
  </UnstyledButton>
}

const Wrapper: React.FC<WrapperProps> = (props: WrapperProps) => {
    const [opened, { toggle }] = useDisclosure();
    const location = useLocation();
    const naviator = useNavigate();

    const gotoPage = (page: string) => () => {
        naviator("/"+page);
    }

    return (
        <AppShell
        navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
        }}
        padding="md"
    >
        <AppShell.Navbar p="sm" display={"flex"}>
            <Flex flex={1}  direction="column" w={"100%"} h={"100&"} justify='between'>
                <Stack flex={1}>
                <Title style={{fontStyle: "italic"}} order={3} my={"lg"} ms={"lg"}>Scheduler</Title>
                    <Stack gap={rem(5)}>
                        <MenuItem label='Schedule' icon={IconCalendarStats} active={location.pathname == "/schedule"} onClick={gotoPage("schedule")} />
                        <MenuItem label='Employees' icon={IconUsers} active={location.pathname == "/employees"} onClick={gotoPage("employees")} />
                        <MenuItem label='Settings' icon={IconSettings} active={location.pathname == "/settings"} onClick={gotoPage("settings")} />
                    </Stack>
                </Stack>
                <Menu>
                            <Menu.Target>
                <UnstyledButton>
                    <Group p={"lg"}>
                        <Avatar
                        radius="xl"
                        />

                        <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                                {props.userInfo.given_name}
                            </Text>

                            <Text c="dimmed" size="xs">
                                email@mail.com
                            </Text>
                        </div>
                        
                        <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
                    </Group>
                </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item onClick={() => props.logout()} leftSection={<IconDoorExit />}>Logout</Menu.Item>
                </Menu.Dropdown>
            </Menu>
            </Flex>
        </AppShell.Navbar>

        <AppShell.Main py={0} pos={"relative"} bg={"#F7FBFF"}>
            <Outlet />
        </AppShell.Main>
    </AppShell>
    )
}

export default Wrapper

import { Button, Center, Paper, Stack, Title } from '@mantine/core';
import { Icon2fa, IconLogin } from '@tabler/icons-react';
import React from 'react'; 

interface AnonymousProps { 
    login: () => Promise<void>;
    loggingIn: boolean
} 

const Anonymous: React.FC<AnonymousProps> = ({ login, loggingIn }) => {
    return (
        <Center w={"100vw"} h={"100vh"}>
            <Paper withBorder p={"xl"}>
                <Title mb={"xl"} ta={"center"} order={2}>Login</Title>
                <Stack>
                    <Button loading={loggingIn} onClick={login} leftSection={<IconLogin />}>Login As Manager</Button>
                    <Button loading={loggingIn} onClick={login} leftSection={<IconLogin />}>Login As Employee</Button>
                </Stack>
            </Paper>
        </Center>
    )
} 

export default Anonymous; 

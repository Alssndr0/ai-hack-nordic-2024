import React from 'react';
import useAuth, { login, logout } from '../utils/useAuth';
import Authenticated from './Authenticated';
import Anonymous from './Anonymous';
import { Center, Flex, Loader, Paper, Stack, Title } from '@mantine/core';

const LoadingLoginState = () => (
    <Center w={"100vw"} h={"100vh"}>
        <Paper withBorder p={"xl"}>
            <Flex direction={"column"} align={"center"}>
                <Title ta={"center"} order={2}>Waiting for login state info</Title>
                <Loader color="blue" type="dots" />
            </Flex>
        </Paper>
    </Center>
);

const LoggingOut = () => (
    <Center w={"100vw"} h={"100vh"}>
        <Paper withBorder p={"xl"}>
            <Flex direction={"column"} align={"center"}>
                <Title ta={"center"} order={2}>Logging out</Title>
                <Loader color="blue" type="dots" />
            </Flex>
        </Paper>
    </Center>
);

export const WaitingForUser = () => (
    <Center w={"100vw"} h={"100vh"}>
        <Paper withBorder p={"xl"}>
            <Flex direction={"column"} align={"center"}>
                <Title ta={"center"} order={2}>Waiting for user information</Title>
                <Loader color="blue" type="dots" />
            </Flex>
        </Paper>
    </Center>
);

const Main: React.FC = () => {
    const { getLoginStateComplete, isLoggedIn, csrf, userInfo, isLoggingOut } = useAuth();
    
    const component: React.ReactElement = (() => { 
        if (isLoggingOut) return <LoggingOut />;
        if (!getLoginStateComplete) return <LoadingLoginState />;
        if (!isLoggedIn) return <Anonymous loggingIn={false} login={login} />;
        if (!userInfo) return <WaitingForUser />;
        if (!csrf) throw new Error("No csrf!"); 
        return <Authenticated logout={logout} userInfo={userInfo} csrf={csrf} />;
    })();  

    return component; 
}

export default Main;

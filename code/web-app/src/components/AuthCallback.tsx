import React, { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { exchange_code_for_cookies } from '../utils/oauthAgentClient'; 
import { Center, Flex, Loader, Paper, Title } from '@mantine/core';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => { 
    (async () => { 
      await exchange_code_for_cookies(window.location.href);
      navigate('/', { replace: true });
    })();
  }, [navigate]); 

  return (
      <Center w={"100vw"} h={"100vh"}>
          <Paper withBorder p={"xl"}>
              <Flex direction={"column"} align={"center"}>
                  <Title ta={"center"} order={2}>Signing in</Title>
                  <Loader color="blue" type="dots" />
              </Flex>
          </Paper>
      </Center>
  );
}

export default AuthCallback;

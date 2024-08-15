import React, { useState } from 'react'; 
import { ApolloProvider } from '@apollo/client';
import create_api_client from '../utils/apolloClient';
import Products from './Items';
import Wrapper from './Wrapper/Wrapper';
import Onboarding from './Onboarding';

interface AuthenticatedProps {
  userInfo: Record<string, any>; 
  logout: () => void; 
  csrf: string;
}

function on_graphql_error(messages: string[]) { 
    messages.forEach(message => alert(message)); 
} 

const Authenticated: React.FC<AuthenticatedProps> = ({ userInfo, logout, csrf }) => {
    const [isSetup, setIsSetup] = useState(false);
    return (
        <ApolloProvider client={create_api_client(csrf, on_graphql_error)}>
            {!isSetup && <Onboarding csrf={csrf} onFinish={() => setIsSetup(true)} logout={logout} userInfo={userInfo} />}
            {isSetup && <Wrapper csrf={csrf} logout={logout} userInfo={userInfo} />}
        </ApolloProvider>
    )
} 

export default Authenticated;


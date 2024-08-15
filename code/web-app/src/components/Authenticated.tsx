import React, { useState } from 'react'; 
import { ApolloProvider, useQuery } from '@apollo/client';
import create_api_client from '../utils/apolloClient';
import Wrapper from './Wrapper/Wrapper';
import Onboarding from './Onboarding';
import { BUSINESS_INFO } from '../graphql/items';
import { WaitingForUser } from './Main';

interface AuthenticatedProps {
  userInfo: Record<string, any>; 
  logout: () => void; 
  csrf: string;
}

function on_graphql_error(messages: string[]) { 
    messages.forEach(message => alert(message)); 
} 

const Brancher: React.FC<AuthenticatedProps> = ({ userInfo, logout, csrf }) => {
    const [isSetup, setIsSetup] = useState<boolean|null>(null);
    const {loading, error, data} = useQuery(BUSINESS_INFO);
    console.log("data", data)
    if(loading) {
        return <WaitingForUser />
    }
    return <>
        {isSetup == null && data.businessesOnboardingInfo.length == 0 && <Onboarding csrf={csrf} onFinish={() => setIsSetup(true)} logout={logout} userInfo={userInfo} />}
        {(isSetup == true || data.businessesOnboardingInfo.length >= 1) && <Wrapper csrf={csrf} logout={logout} userInfo={userInfo} />}
    </>
}

const Authenticated: React.FC<AuthenticatedProps> = ({ userInfo, logout, csrf }) => {
    return (
        <ApolloProvider client={create_api_client(csrf, on_graphql_error)}>
            <Brancher csrf={csrf} logout={logout} userInfo={userInfo} />
        </ApolloProvider>
    )
} 

export default Authenticated;


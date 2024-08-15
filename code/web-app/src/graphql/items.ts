import { gql } from '@apollo/client';

export const ITEMS = gql`
  query ItemsGet {
    items { name, id }
  }
`;

export const ITEMS_CREATE = gql`
  mutation ItemCreate($items: [ItemCreateInput!]!) {
    itemsCreate(items: $items) {
        name 
        id
    }
  }
`;

export const CHAT_ONBOARD_ADD = gql`
  mutation ChatOnboarding ($human: [String!]!, $chatbot: [String!]!){
    addMessage(human: $human, chatbot: $chatbot) {
      response
    }
  }
`;


export const CHAT_ONBOARD_FINISH = gql`
  mutation ChatOnboarding ($human: [String!]!, $chatbot: [String!]!, $summary: String!){
    convertSummaryToJsonAndPopulateDb(summaryInput: {human: $human, chatbot: $chatbot, summary: $summary}) {
      id,
      status
    }
  }
`;

export const BUSINESS_INFO = gql`
  query GetBusiness {
    businessesOnboardingInfo {
      info,
      id
    } 
  }
`;

export const CREATE_SCHEDULE = gql`
  mutation CreateSchedule {
    schedulesCreate {
      id,
      employeeId,
      roleId,
      shiftId
    } 
  }
`;



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
    convertSummaryToJsonAndPopulateDb(summaryInput: {human: $human, chatbot: $chatbot, summary: $summary})
  }
`;

export const ITEMS_REMOVE = gql`
  mutation ItemsRemove($ids: [String!]!) {
    itemsRemove(ids: $ids) 
  }
`;

export const ITEMS_CREATED = gql`
  subscription OnItemCreated {
    itemsCreated { name, id }
  }
`;
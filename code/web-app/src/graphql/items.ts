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

export const SCHEDULE_QUERY = gql`
  query GetSchedule($year: Int!, $week: Int!) {
    getSchedulesByWeek(year: $year, week: $week) {
      firstName,
      lastName,
      date,
      shiftName,
      startTime,
      endTime,
      roleName
    } 
  }
`;

export const SCHEDULE_TEMPLATE_QUERY = gql`
  query GetScheduleTemplate {
    scheduleTemplate {
      shiftId,
      dayOfWeek,
      openTime,
      closeTime,
      shiftName,
      startTime,
      endTime,
      roleName,
      locationId,
      employeesRequired
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

export const UPLOAD_EMPLOYEE_FILES_MUTATION = gql`
  mutation ProcessEmployeeFiles($files: [String!]!) {
    processEmployeeFiles(input: { files: $files }) {
      firstName
      lastName
      phoneNumber
      email
      address
      dateOfBirth
      emergencyContact
      dateHired
      contractedHours
      locations
      roles
    }
  }
`;

export const QUERY_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      employeeId
      firstName
      lastName
      address
      dateOfBirth
      emergencyContact
      dateHired
      email
      contractedHours
    }
  }
`;


export const POST_EMPLOYEE = gql`
  mutation PostEmployees($employeeId: String!, $firstName:String!,$lastName:String!,$email:String!,$address:String!,$dateOfBirth:String!,$emergencyContact:String!,$dateHired:String!,$contractedHours:String!,$locations:[String!]!,$roles:[String!]!) {
    onboardEmployee(input: {employeeId: $employeeId, firstName: $firstName, lastName: $lastName, email:$email,address:$address,dateOfBirth:$dateOfBirth,emergencyContact:$emergencyContact,dateHired:$dateHired,contractedHours:$contractedHours,locations:$locations,roles:$roles}) {
      employeeId
    }
  }
`;


export const QUERY_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
    }
  }
`;

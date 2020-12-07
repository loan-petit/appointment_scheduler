import gql from 'graphql-tag'

import AppointmentType from './AppointmentType'
import RecurrentAvailability from './RecurrentAvailability'

type User = {
  id: number
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  websiteUrl?: string
  phone?: string
  address?: string
  minScheduleNotice: number
  appointmentTypes?: AppointmentType[]
  recurrentAvailabilities?: RecurrentAvailability[]
}

export const UserFragments = {
  fields: gql`
    fragment UserFields on User {
      __typename
      id
      email
      password
      username
      firstName
      lastName
      websiteUrl
      address
      minScheduleNotice
    }
  `,
  publicFields: gql`
    fragment UserPublicFields on User {
      id
      email
      username
      firstName
      lastName
      websiteUrl
      address
    }
  `,
}

export const UserOperations = {
  user: gql`
    query UserQuery($username: String!) {
      user(where: { username: $username }) {
        ...UserFields
      }
    }
    ${UserFragments.fields}
  `,
  userPublicFieldsOnly: gql`
    query UserPublicFieldsOnlyQuery($username: String!) {
      user(where: { username: $username }) {
        ...UserPublicFields
      }
    }
    ${UserFragments.publicFields}
  `,
  currentUserIdOnly: gql`
    query CurrentUserIdOnlyQuery {
      me {
        user {
          id
        }
      }
    }
  `,
  currentUser: gql`
    query CurrentUserQuery {
      me {
        user {
          ...UserFields
        }
      }
    }
    ${UserFragments.fields}
  `,
  currentUserPublicFieldsOnly: gql`
    query CurrentUserPublicFieldsOnlyQuery {
      me {
        user {
          ...UserPublicFields
        }
      }
    }
    ${UserFragments.publicFields}
  `,
  updateCurrentUser: gql`
    mutation UpdateCurrentUserMutation(
      $email: String
      $firstName: String
      $lastName: String
      $websiteUrl: String
      $address: String
      $minScheduleNotice: Int
    ) {
      updateCurrentUser(
        email: $email
        firstName: $firstName
        lastName: $lastName
        websiteUrl: $websiteUrl
        address: $address
        minScheduleNotice: $minScheduleNotice
      ) {
        ...UserFields
      }
    }
    ${UserFragments.fields}
  `,
  updateCurrentUserPassword: gql`
    mutation UpdateCurrentUserPasswordMutation(
      $oldPassword: String!
      $newPassword: String!
    ) {
      updateCurrentUser(oldPassword: $oldPassword, newPassword: $newPassword) {
        id
      }
    }
  `,
}

export default User

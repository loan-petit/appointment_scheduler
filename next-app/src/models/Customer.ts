import gql from 'graphql-tag'

import Appointment from './appointment/Appointment'
import AppointmentFragments from './appointment/AppointmentFragments'

type Customer = {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  isBlackListed?: boolean
  appointments?: Appointment[]
}

export const CustomerFragments = {
  fields: gql`
    fragment CustomerFields on Customer {
      __typename
      id
      email
      firstName
      lastName
      phone
      address
      isBlackListed
    }
  `,
}

export const CustomerOperations = {
  customers: gql`
    query CustomersQuery($userId: Int!) {
      user(where: { id: $userId }) {
        customers {
          ...CustomerFields
          appointments {
            ...AppointmentFields
          }
        }
      }
    }
    ${CustomerFragments.fields}
    ${AppointmentFragments.fields}
  `,
  upsertOne: gql`
    mutation UpsertOneCustomerMutation(
      $userId: Int!
      $email: String!
      $firstName: String!
      $lastName: String!
      $phone: String
      $address: String
    ) {
      upsertOneCustomer(
        create: {
          email: $email
          firstName: $firstName
          lastName: $lastName
          phone: $phone
          address: $address
          users: { connect: { id: $userId } }
        }
        update: {
          firstName: { set: $firstName }
          lastName: { set: $lastName }
          phone: { set: $phone }
          address: { set: $address }
          users: { connect: { id: $userId } }
        }
        where: { email: $email }
      ) {
        ...CustomerFields
      }
    }
    ${CustomerFragments.fields}
  `,
}

export default Customer

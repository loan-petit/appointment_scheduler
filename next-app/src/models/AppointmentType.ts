import gql from 'graphql-tag'

import User from './User'

type AppointmentType = {
  id: number
  name: string
  description?: string
  duration: number
  price?: number
  user?: User
}

export const AppointmentTypeFragments = {
  fields: gql`
    fragment AppointmentTypeFields on AppointmentType {
      __typename
      id
      name
      description
      duration
      price
    }
  `,
}

export const AppointmentTypeOperations = {
  appointmentType: gql`
    query AppointmentTypeQuery($appointmentTypeId: Int!) {
      appointmentType(where: { id: $appointmentTypeId }) {
        ...AppointmentTypeFields
      }
    }
    ${AppointmentTypeFragments.fields}
  `,
  appointmentTypes: gql`
    query AppointmentTypesQuery($userId: Int!) {
      user(where: { id: $userId }) {
        __typename
        appointmentTypes {
          ...AppointmentTypeFields
        }
      }
    }
    ${AppointmentTypeFragments.fields}
  `,
  upsertOne: gql`
    mutation UpsertOneAppointmentTypeMutation(
      $appointmentTypeId: Int!
      $name: String!
      $description: String
      $duration: Int!
      $price: Float
      $userId: Int!
    ) {
      upsertOneAppointmentType(
        create: {
          name: $name
          description: $description
          duration: $duration
          price: $price
          user: { connect: { id: $userId } }
        }
        update: {
          name: { set: $name }
          description: { set: $description }
          duration: { set: $duration }
          price: { set: $price }
        }
        where: { id: $appointmentTypeId }
      ) {
        ...AppointmentTypeFields
      }
    }
    ${AppointmentTypeFragments.fields}
  `,
  deleteOne: gql`
    mutation DeleteOneAppointmentTypeMutation($appointmentTypeId: Int!) {
      deleteOneAppointmentType(where: { id: $appointmentTypeId }) {
        ...AppointmentTypeFields
      }
    }
    ${AppointmentTypeFragments.fields}
  `,
}

export default AppointmentType

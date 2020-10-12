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
}

export default AppointmentType

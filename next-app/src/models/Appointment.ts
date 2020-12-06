import User from './User'
import Customer, { CustomerFragments } from './Customer'
import gql from 'graphql-tag'
import AppointmentType, { AppointmentTypeFragments } from './AppointmentType'

type Appointment = {
  id: number
  start: Date
  end: Date
  googleCalendarEventId?: boolean
  appointmentType?: AppointmentType
  user?: User
  customer?: Customer
}

export const AppointmentFragments = {
  fields: gql`
    fragment AppointmentFields on Appointment {
      __typename
      id
      start
      end
      googleCalendarEventId
    }
  `,
}

export const AppointmentOperations = {
  appointments: gql`
    query AppointmentsQuery($userId: Int!) {
      user(where: { id: $userId }) {
        appointments {
          ...AppointmentFields
          appointmentType {
            ...AppointmentTypeFields
          }
          customer {
            ...CustomerFields
          }
        }
      }
    }
    ${AppointmentFragments.fields}
    ${AppointmentTypeFragments.fields}
    ${CustomerFragments.fields}
  `,
  appointmentsForCustomer: gql`
    query AppointmentsForCustomerQuery($customerId: Int!) {
      customer(where: { id: $customerId }) {
        appointments {
          ...AppointmentFields
          appointmentType {
            ...AppointmentTypeFields
          }
        }
      }
    }
    ${AppointmentFragments.fields}
    ${AppointmentTypeFragments.fields}
  `,
}

export default Appointment

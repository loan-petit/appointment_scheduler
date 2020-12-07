import gql from 'graphql-tag'

import { CustomerFragments } from '../Customer'
import { AppointmentTypeFragments } from '../AppointmentType'
import AppointmentFragments from './AppointmentFragments'

const AppointmentOperations = {
  appointment: gql`
    query AppointmentQuery($appointmentId: Int!) {
      appointment(where: { id: $appointmentId }) {
        ...AppointmentFields
        appointmentType {
          ...AppointmentTypeFields
        }
        customer {
          ...CustomerFields
        }
      }
    }
    ${AppointmentFragments.fields}
    ${AppointmentTypeFragments.fields}
    ${CustomerFragments.fields}
  `,
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
  createOne: gql`
    mutation CreateOneAppointmentMutation(
      $userId: Int!
      $customerId: Int!
      $appointmentTypeId: Int!
      $start: DateTime!
      $end: DateTime!
    ) {
      createOneAppointment(
        data: {
          start: $start
          end: $end
          appointmentType: { connect: { id: $appointmentTypeId } }
          user: { connect: { id: $userId } }
          customer: { connect: { id: $customerId } }
        }
      ) {
        ...AppointmentFields
        appointmentType {
          ...AppointmentTypeFields
        }
        customer {
          ...CustomerFields
        }
      }
    }
    ${AppointmentFragments.fields}
    ${AppointmentTypeFragments.fields}
    ${CustomerFragments.fields}
  `,
  deleteOne: gql`
    mutation DeleteOneAppointmentMutation($appointmentId: Int!) {
      deleteOneAppointment(where: { id: $appointmentId }) {
        ...AppointmentFields
      }
    }
    ${AppointmentFragments.fields}
  `,
}

export default AppointmentOperations

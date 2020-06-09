import User from './User'
import Customer from './Customer'
import gql from 'graphql-tag'
import AppointmentType from './AppointmentType'

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

export default Appointment

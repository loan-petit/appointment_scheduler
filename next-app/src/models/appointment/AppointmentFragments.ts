import gql from 'graphql-tag'

const AppointmentFragments = {
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

export default AppointmentFragments

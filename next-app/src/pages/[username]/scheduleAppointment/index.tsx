import React from 'react'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../../../apollo/client'
import ContactInformation from '../../../components/appointmentScheduler/ContactInformation'
import LoadingOverlay from '../../../components/shared/LoadingOverlay'
import User, { UserFragments } from '../../../models/User'
import Event, { EventOperations } from '../../../models/Event'
import Layout from '../../../components/appointmentScheduler/Layout'
import SelectAppointmentType from '../../../components/appointmentScheduler/SelectAppointmentType'
import SelectDateTime from '../../../components/appointmentScheduler/SelectDateTime'

const UserQuery = gql`
  query UserQuery($username: String!) {
    user(where: { username: $username }) {
      ...UserFields
    }
  }
  ${UserFragments.fields}
`

const AppointmentScheduler = () => {
  const router = useRouter()

  const [selectedEvent, setSelectedEvent] = React.useState<Event>()
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date>()

  var [user, setUser] = React.useState<User>()
  const userQueryResult = useQuery(UserQuery, {
    variables: {
      username: router.query.username,
    },
  })

  const eventsQueryResult = useQuery(EventOperations.events, {
    variables: { userId: user?.id },
    skip: !user,
  })

  // Verify UserQuery result
  if (userQueryResult.loading) return <LoadingOverlay />
  else if (userQueryResult.error) {
    return (
      <p className='error-message'>
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  if (!user) {
    setUser(userQueryResult.data.user)
  }

  // Verify EventsQuery result
  if (eventsQueryResult.loading) return <LoadingOverlay />
  else if (eventsQueryResult.error) {
    return (
      <p className='error-message'>
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!eventsQueryResult.data) {
    return <div />
  }
  const events: Event[] = eventsQueryResult.data.user.events

  console.log(selectedDateTime)

  return (
    <Layout user={user}>
      {!selectedEvent && (
        <SelectAppointmentType
          events={events}
          selectEvent={(eventId: number) =>
            setSelectedEvent(events.find(v => v.id == eventId))
          }
        />
      )}
      {user && selectedEvent && !selectedDateTime && (
        <SelectDateTime
          user={user}
          event={selectedEvent}
          selectDateTime={setSelectedDateTime}
        />
      )}
      {user && selectedEvent && selectedDateTime && (
        <ContactInformation
          user={user}
          event={selectedEvent}
          dateTime={selectedDateTime}
        />
      )}
    </Layout>
  )
}

export default withApollo(AppointmentScheduler)

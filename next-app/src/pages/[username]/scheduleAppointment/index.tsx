import React from 'react'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../apollo/client'
import { useQuery } from '@apollo/react-hooks'
import LoadingOverlay from '../../../components/LoadingOverlay'
import User from '../../../models/User'
import Event, { EventOperations } from '../../../models/Event'

const UserQuery = gql`
  query UserQuery($username: String!) {
    user(where: { username: $username }) {
      id
      firstName
      lastName
      websiteUrl
    }
  }
`

const ScheduleAppointment = () => {
  const router = useRouter()

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
      <p className="error-message">
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
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!eventsQueryResult.data) {
    return <div />
  }
  const events: Event[] = eventsQueryResult.data.user.events

  return (
    <div className="flex flex-wrap">
      {events.map((event, i) => (
        <div
          key={i}
          className="flex justify-between w-full m-4 bg-white rounded-lg shadow-lg cursor-pointer break-words00 md:w-4/12"
          onClick={() =>
            router.push(
              `/${router.query.username}/scheduleAppointment/${event.id}`,
            )
          }
        >
          <div className="flex flex-col p-4 break-words">
            <h4 className="text-xl font-semibold">{event.name}</h4>
            <p className="mt-1 text-gray-600">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default withApollo(ScheduleAppointment)

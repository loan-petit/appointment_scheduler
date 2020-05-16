import * as React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Router from 'next/router'

import LoadingOverlay from '../../components/LoadingOverlay'
import User from '../../models/User'
import Event from '../../models/Event'
import { withApollo } from '../../apollo/client'
import Layout from '../../components/Layout'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`

const EventsQuery = gql`
  query EventsQuery($ownerId: Int!) {
    user(where: { id: $ownerId }) {
      events {
        id
        name
        description
        duration
        price
        generateClientSheet
      }
    }
  }
`

const Events = () => {
  const [currentUser, setCurrentUser] = React.useState<User>()

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const eventsQueryResult = useQuery(EventsQuery, {
    variables: { ownerId: currentUser?.id },
    skip: !currentUser,
  })

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  if (currentUserQueryResult.error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
  }

  // Verify EventsQuery result
  if (eventsQueryResult.loading) return <LoadingOverlay />
  if (eventsQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  if (!eventsQueryResult.data) {
    return <div />
  }
  var events: Event[] = eventsQueryResult.data.user.events

  return (
    <Layout>
      <div className="flex justify-center pb-2">
        <Link href="/events/upsertOne">
          <a className="flex flex-row items-center justify-center py-4 text-gray-800 rounded-lg lg:w-1/2 hover:bg-gray-300">
            <FontAwesomeIcon icon={faPlus} />
            <p className="pl-4">Créer un nouvel événement</p>
          </a>
        </Link>
      </div>
      {/* Events */}
      <div className="flex flex-wrap">
        {events.map((event, i) => (
          <div key={i} className="w-full p-4 text-center md:w-4/12">
            <Link href={`/events/upsertOne?id=${event.id}`}>
              <a className="flex flex-col p-4 break-words bg-white rounded-lg shadow-lg">
                <h6 className="text-xl font-semibold">{event.name}</h6>
                <p className="m-2 text-gray-600">{event.description}</p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default withApollo(Events)

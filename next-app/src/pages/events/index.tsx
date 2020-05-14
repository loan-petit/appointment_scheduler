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
      <Link href="/events/upsertOne">
        <div className="flex flex-row items-center justify-center">
          <FontAwesomeIcon icon={faPlus} />
          <p className="pl-4">Créer un nouvel événement</p>
        </div>
      </Link>
      {/* Events */}
      <div className="flex flex-wrap">
        {events.map((event, i) => (
          <div
            key={i}
            className="w-full px-4 pt-6 text-center lg:pt-12 md:w-4/12"
          >
            <div className="relative flex flex-col w-full min-w-0 mb-8 break-words bg-white rounded-lg shadow-lg">
              <div className="flex-auto px-4 py-5">
                <h6 className="text-xl font-semibold">{event.name}</h6>
                <p className="mt-2 mb-4 text-gray-600">{event.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default withApollo(Events)

import * as React from 'react'

import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import LoadingOverlay from '../../components/LoadingOverlay'
import User from '../../models/User'
import Event from '../../models/Event'
import { withApollo } from '../../apollo/client'
import Layout from '../../components/Layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
        email
        firstName
        lastName
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
        cost
        generateClientSheet
      }
    }
  }
`

const Events = () => {
  var { loading, error, data } = useQuery(CurrentUserQuery)
  if (loading) return <LoadingOverlay />
  if (error) {
    return <p className="error-message" />
  }
  var currentUser: User = data.me.user

  var { loading, error, data } = useQuery(EventsQuery, {
    variables: { ownerId: currentUser.id },
  })
  if (loading) return <LoadingOverlay />
  if (error) {
    return <p className="error-message" />
  }
  var events: Event[] = data.user.events

  return (
    <Layout>
      <Link href="/events/create">
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

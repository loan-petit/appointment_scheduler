import * as React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Router from 'next/router'

import LoadingOverlay from '../../components/LoadingOverlay'
import User from '../../models/User'
import Event, { EventFragments } from '../../models/Event'
import { withApollo } from '../../apollo/client'
import Layout from '../../components/Layout'
import WarningModal from '../../components/WarningModal'

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
        ...EventFields
      }
    }
  }
  ${EventFragments.fields}
`

const DeleteOneEventMutation = gql`
  mutation DeleteOneEventMutation($eventId: Int!) {
    deleteOneEvent(where: { id: $eventId }) {
      ...EventFields
    }
  }
  ${EventFragments.fields}
`

const Events = () => {
  const [currentUser, setCurrentUser] = React.useState<User>()
  const [events, setEvents] = React.useState<Event[]>()

  const [isEventDetailsOpen, setIsEventDetailsOpen] = React.useState<
    boolean[]
  >()
  const [eventToDeleteId, setEventToDeleteId] = React.useState(-1)

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const eventsQueryResult = useQuery(EventsQuery, {
    variables: { ownerId: currentUser?.id },
    skip: !currentUser,
  })
  const [deleteOneEvent] = useMutation(DeleteOneEventMutation)

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  else if (currentUserQueryResult.error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
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

  if (!events) {
    setIsEventDetailsOpen(
      new Array(eventsQueryResult.data.user.events.length).fill(false),
    )
    setEvents(eventsQueryResult.data.user.events)
  }

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
        {events?.map((event, i) => (
          <div
            key={i}
            className="flex justify-between w-full m-4 text-gray-800 bg-white rounded-lg shadow-lg md:w-4/12"
          >
            <div className="flex flex-col p-4 break-words">
              <h4 className="text-xl font-semibold">{event.name}</h4>
              <p className="mt-1 text-gray-600">{event.description}</p>
            </div>

            <div className="relative m-4">
              <FontAwesomeIcon
                icon={faEllipsisH}
                onClick={() =>
                  setIsEventDetailsOpen(
                    isEventDetailsOpen?.map((x, j) => (i == j ? !x : false)),
                  )
                }
                className="cursor-pointer"
              />
              <div
                className={
                  'absolute right-0 p-2 bg-white border border-gray-200 rounded-md shadow-lg ' +
                  (isEventDetailsOpen && isEventDetailsOpen[i] ? '' : 'hidden')
                }
              >
                <Link href={`/events/upsertOne?id=${event.id}`}>
                  <a className="block p-2">Éditer</a>
                </Link>
                <a
                  className="block p-2 text-red-500 cursor-pointer hover:text-red-400"
                  onClick={() => setEventToDeleteId(event.id)}
                >
                  Supprimer
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <WarningModal
        warningMessage="Vous êtes sur le point de supprimer un événement, confirmez-vous cette action ?"
        onCancel={() => setEventToDeleteId(-1)}
        onConfirm={() => {
          deleteOneEvent({
            variables: { eventId: eventToDeleteId },
          })
          setEventToDeleteId(-1)
          setIsEventDetailsOpen(
            new Array(isEventDetailsOpen?.length).fill(false),
          )
        }}
        isShown={eventToDeleteId >= 0}
      />
    </Layout>
  )
}

export default withApollo(Events)

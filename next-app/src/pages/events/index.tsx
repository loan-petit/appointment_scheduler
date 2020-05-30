import * as React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Router from 'next/router'

import LoadingOverlay from '../../components/shared/LoadingOverlay'
import User from '../../models/User'
import Event, { EventFragments, EventOperations } from '../../models/Event'
import { withApollo } from '../../apollo/client'
import Layout from '../../components/adminSite/Layout'
import WarningModal from '../../components/shared/WarningModal'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
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

  const [isEventDetailsOpen, setIsEventDetailsOpen] = React.useState<
    boolean[]
  >()
  const [eventToDeleteId, setEventToDeleteId] = React.useState(-1)

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const eventsQueryResult = useQuery(EventOperations.events, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  })
  const [deleteOneEvent] = useMutation(DeleteOneEventMutation, {
    update (cache, { data: { deleteOneEvent } }) {
      const { user }: any = cache.readQuery({
        query: EventOperations.events,
        variables: { userId: currentUser?.id },
      })

      const removedEventIndex = user.events.findIndex(
        (e: Event) => e.id == deleteOneEvent.id,
      )
      if (removedEventIndex > -1) {
        user.events.splice(removedEventIndex, 1)
      }

      cache.writeQuery({
        query: EventOperations.events,
        variables: { userId: currentUser?.id },
        data: {
          __typename: 'User',
          user: {
            ...user,
            events: user.events,
          },
        },
      })
    },
  })

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
      <p className='error-message'>
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!eventsQueryResult.data) {
    return <div />
  }
  const events: Event[] = eventsQueryResult.data.user.events

  return (
    <Layout>
      <div className='flex justify-center pb-2'>
        <Link href='/events/upsertOne'>
          <a className='flex flex-row items-center justify-center py-4 rounded-lg lg:w-1/2 hover:bg-gray-300'>
            <FontAwesomeIcon icon={faPlus} />
            <p className='pl-4 text-lg'>Créer un nouvel événement</p>
          </a>
        </Link>
      </div>

      {/* Events */}
      <div className='flex flex-wrap'>
        {events.map((event, i) => (
          <div
            key={i}
            className='flex justify-between w-full m-4 text-gray-800 bg-white rounded-lg shadow-lg md:w-4/12'
          >
            <div className='flex flex-col p-4 break-words'>
              <h4 className='text-xl font-semibold'>{event.name}</h4>
              <p className='mt-1 text-gray-600'>{event.description}</p>
            </div>

            <div className='relative m-4'>
              <FontAwesomeIcon
                icon={faEllipsisH}
                onClick={() =>
                  setIsEventDetailsOpen(
                    (
                      isEventDetailsOpen || new Array(events.length).fill(false)
                    ).map((x, j) => (i == j ? !x : false)),
                  )
                }
                className='cursor-pointer'
              />
              <div
                className={
                  'absolute right-0 p-2 bg-white border border-gray-200 rounded-md shadow-lg ' +
                  (isEventDetailsOpen && isEventDetailsOpen[i] ? '' : 'hidden')
                }
              >
                <Link href={`/events/upsertOne?id=${event.id}`}>
                  <a className='block p-2'>Éditer</a>
                </Link>
                <a
                  className='block p-2 text-red-500 hover:text-red-600'
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
        warningMessage='Vous êtes sur le point de supprimer un événement, confirmez-vous cette action ?'
        onCancel={() => setEventToDeleteId(-1)}
        onConfirm={() => {
          deleteOneEvent({
            variables: { eventId: eventToDeleteId },
          })
          setEventToDeleteId(-1)
          setIsEventDetailsOpen(new Array(events.length).fill(false))
        }}
        isShown={eventToDeleteId >= 0}
      />
    </Layout>
  )
}

export default withApollo(Events)

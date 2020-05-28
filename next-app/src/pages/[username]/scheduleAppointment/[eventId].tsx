import React from 'react'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../../apollo/client'
import { useQuery } from '@apollo/react-hooks'
import LoadingOverlay from '../../../components/LoadingOverlay'
import Event, { EventFragments } from '../../../models/Event'

const EventQuery = gql`
  query EventQuery($eventId: Int!) {
    event(where: { id: $eventId }) {
      ...EventFields
    }
  }
  ${EventFragments.fields}
`

const ScheduleAppointment = () => {
  const router = useRouter()

  const { loading, error, data } = useQuery(EventQuery, {
    variables: { eventId: Number(router.query.eventId) },
  })

  if (loading) return <LoadingOverlay />
  else if (error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  const event: Event = data.event

  return <p> {event.name}</p>
}

export default withApollo(ScheduleAppointment)

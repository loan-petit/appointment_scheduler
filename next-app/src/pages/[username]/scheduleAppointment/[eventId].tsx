import React from 'react'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import DayPicker from 'react-day-picker'
import MomentLocaleUtils from 'react-day-picker/moment'
import 'moment/locale/fr'

import { withApollo } from '../../../apollo/client'
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

  const [selectedDate, setSelectedDate] = React.useState<Date>()

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
  console.log(event)

  return (
    <DayPicker
      localeUtils={MomentLocaleUtils}
      locale="fr"
      selectedDays={selectedDate}
      onDayClick={(day, { selected }) =>
        selected ? setSelectedDate(undefined) : setSelectedDate(day)
      }
    />
  )
}

export default withApollo(ScheduleAppointment)

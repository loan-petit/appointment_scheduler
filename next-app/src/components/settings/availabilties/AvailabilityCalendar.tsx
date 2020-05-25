import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import LoadingOverlay from '../../LoadingOverlay'
import User from '../../../models/User'
import Availability, {
  AvailabilityFragments,
} from '../../../models/Availability'
import RecurrentAvailability, {
  RecurrentAvailabilityHelpers,
} from '../../../models/RecurrentAvailability'
import DynamicFullCalendar from '../../fullCalendar/DynamicFullCalendar'

const AvailabilitiesQuery = gql`
  query AvailabilitiesQuery($userId: Int!) {
    user(where: { id: $userId }) {
      availabilities {
        ...AvailabilityFields
      }
    }
  }
  ${AvailabilityFragments.fields}
`

type Props = {
  currentUser: User
  recurrentAvailabilities: RecurrentAvailability[]
}

const AvailabilityCalendar: React.FunctionComponent<Props> = ({
  currentUser,
  recurrentAvailabilities,
}) => {
  const calendarComponentRef = React.createRef()
  const [calendarEvents, setCalendarEvents] = React.useState<any>([
    { title: 'Event Now', start: new Date() },
  ])

  const availabilitiesQueryResult = useQuery(AvailabilitiesQuery, {
    variables: { userId: currentUser.id },
  })

  // Verify AvailabilityQuery result
  if (availabilitiesQueryResult.loading) return <LoadingOverlay />
  else if (availabilitiesQueryResult.error) {
    console.log(availabilitiesQueryResult.error)
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  const availabilities: Availability[] =
    availabilitiesQueryResult.data.user.availabilities

  const recurrentAvailabilitiesGroupedByDay = RecurrentAvailabilityHelpers.groupByDay(
    recurrentAvailabilities,
  )

  console.log(availabilities)
  console.log(recurrentAvailabilities)
  console.log(recurrentAvailabilitiesGroupedByDay)

  const handleDateClick = (arg: any) => {
    if (confirm('Would you like to add an event to ' + arg.dateStr + ' ?')) {
      setCalendarEvents(
        calendarEvents.concat({
          title: 'New Event',
          start: arg.date,
          allDay: arg.allDay,
        }),
      )
    }
  }

  return (
    <>
      <div className="mb-6">
        <h5>Calendrier de vos disponibilités</h5>
      </div>

      <DynamicFullCalendar
        defaultView="dayGridMonth"
        header={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        ref={calendarComponentRef}
        events={calendarEvents}
        dateClick={handleDateClick}
      />
    </>
  )
}

export default AvailabilityCalendar

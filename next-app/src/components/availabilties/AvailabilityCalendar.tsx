import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import LoadingOverlay from '../LoadingOverlay'
import User from '../../models/User'
import Availability, { AvailabilityFragments } from '../../models/Availability'
import RecurrentAvailability from '../../models/RecurrentAvailability'
import DynamicFullCalendar from '../fullCalendar/DynamicFullCalendar'
import convertSecondsToTimeString from '../../utils/convertSecondsToTimeString'
import Day from '../../models/enums/Day'

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
  const availabilitiesQueryResult = useQuery(AvailabilitiesQuery, {
    variables: { userId: currentUser.id },
  })

  const calendarComponentRef = React.createRef()
  const [calendarEvents, setCalendarEvents] = React.useState<any>([
    { title: 'Event Now', start: new Date(), rendering: 'background' },
  ])

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

  console.log(availabilities)

  const handleDateClick = (arg: any) => {
    if (confirm('Would you like to add an event to ' + arg.dateStr + ' ?')) {
      setCalendarEvents(
        calendarEvents.concat({
          title: 'New Event',
          start: new Date(arg.date),
          allDay: arg.allDay,
          rendering: 'background',
        }),
      )
    }
  }

  const handleSelect = (info: any) => {
    if (
      confirm(
        'Would you like to add an event from ' +
          info.startStr +
          ' to ' +
          info.endStr +
          ' ?',
      )
    ) {
      setCalendarEvents(
        calendarEvents.concat({
          title: 'New Event',
          start: info.start,
          end: info.end,
          allDay: info.allDay,
          rendering: 'background',
        }),
      )
    }
  }
  console.log(handleSelect)

  return (
    <>
      <div className="mb-6">
        <h5>Calendrier de vos disponibilités</h5>
      </div>

      <DynamicFullCalendar
        defaultView="timeGridWeek"
        header={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        views={{
          dayGrid: {
            columnHeaderFormat: {
              weekday: 'short',
            },
          },
          week: {
            columnHeaderFormat: {
              weekday: 'short',
            },
          },
        }}
        ref={calendarComponentRef}
        events={calendarEvents}
        dateClick={handleDateClick}
        // selectable={true}
        // select={handleSelect}
        businessHours={recurrentAvailabilities.map((v) => {
          if (!v.startTime || !v.endTime) return {}

          return {
            daysOfWeek: [Object.values(Day).indexOf(v.day)],
            startTime: convertSecondsToTimeString(v.startTime),
            endTime: convertSecondsToTimeString(v.endTime),
          }
        })}
      />
    </>
  )
}

export default AvailabilityCalendar

import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { EventInput } from '@fullcalendar/core'
import { DateClickApi } from '@fullcalendar/core/Calendar'
import moment from 'moment'

import LoadingOverlay from '../LoadingOverlay'
import User from '../../models/User'
import AvailabilityModifier, {
  AvailabilityModifierFragments,
} from '../../models/AvailabilityModifier'
import RecurrentAvailability from '../../models/RecurrentAvailability'
import DynamicFullCalendar from '../fullCalendar/DynamicFullCalendar'
import convertSecondsToTimeString from '../../utils/convertSecondsToTimeString'
import Day from '../../models/enums/Day'

const AvailabilityModifiersQuery = gql`
  query AvailabilityModifiersQuery($userId: Int!) {
    user(where: { id: $userId }) {
      availabilityModifiers {
        ...AvailabilityModifierFields
      }
    }
  }
  ${AvailabilityModifierFragments.fields}
`

const UpsertOneAvailabilityModifierMutation = gql`
  mutation UpsertOneAvailabilityModifierMutation(
    $availabilityModifierId: Int!
    $day: Day!
    $startTime: Int!
    $endTime: Int!
    $userId: Int!
  ) {
    upsertOneAvailabilityModifier(
      create: {
        date: $date
        startTime: $startTime
        endTime: $endTime
        user: { connect: { id: $userId } }
      }
      update: { date: $date, startTime: $startTime, endTime: $endTime }
      where: { id: $availabilityModifierId }
    ) {
      ...AvailabilityModifierFields
    }
  }
  ${AvailabilityModifierFragments.fields}
`

const DeleteOneAvailabilityModifierMutation = gql`
  mutation DeleteOneAvailabilityModifierMutation(
    $availabilityModifierId: Int!
  ) {
    deleteOneAvailabilityModifier(where: { id: $availabilityModifierId }) {
      ...AvailabilityModifierFields
    }
  }
  ${AvailabilityModifierFragments.fields}
`

type Props = {
  currentUser: User
  recurrentAvailabilities: RecurrentAvailability[]
}

const AvailabilityCalendar: React.FunctionComponent<Props> = ({
  currentUser,
  recurrentAvailabilities,
}) => {
  const { loading, error, data } = useQuery(AvailabilityModifiersQuery, {
    variables: { userId: currentUser.id },
  })

  const calendarComponentRef = React.createRef()
  const [calendarEvents, setCalendarEvents] = React.useState<EventInput[]>([])

  const [upsertOneAvailabilityModifier] = useMutation(
    UpsertOneAvailabilityModifierMutation,
    {
      update(cache, { data: { upsertOneAvailabilityModifier } }) {
        const { user }: any = cache.readQuery({
          query: AvailabilityModifiersQuery,
          variables: { userId: currentUser.id },
        })
        if (
          user.availabilityModifiers.some(
            (e: AvailabilityModifier) =>
              e.id == upsertOneAvailabilityModifier.id,
          )
        )
          return

        cache.writeQuery({
          query: AvailabilityModifiersQuery,
          variables: { userId: currentUser.id },
          data: {
            __typename: 'User',
            user: {
              __typename: 'User',
              ...user,
              availabilityModifiers: user.availabilityModifiers.concat([
                upsertOneAvailabilityModifier,
              ]),
            },
          },
        })
      },
    },
  )
  const [deleteOneAvailabilityModifier] = useMutation(
    DeleteOneAvailabilityModifierMutation,
    {
      update(cache, { data: { deleteOneAvailabilityModifier } }) {
        const { user }: any = cache.readQuery({
          query: AvailabilityModifiersQuery,
          variables: { userId: currentUser?.id },
        })

        const removedAvailabilityModifierIndex = user.availabilityModifiers.findIndex(
          (e: AvailabilityModifier) => e.id == deleteOneAvailabilityModifier.id,
        )
        if (removedAvailabilityModifierIndex > -1) {
          user.availabilityModifiers.splice(removedAvailabilityModifierIndex, 1)
        }

        cache.writeQuery({
          query: AvailabilityModifiersQuery,
          variables: { userId: currentUser?.id },
          data: {
            __typename: 'User',
            user: {
              ...user,
              availabilityModifiers: user.availabilityModifiers,
            },
          },
        })
      },
    },
  )

  // Verify AvailabilityQuery result
  if (loading) return <LoadingOverlay />
  else if (error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  const availabilityModifiers: AvailabilityModifier[] = data.user.availabilities

  console.log(availabilityModifiers)
  console.log(upsertOneAvailabilityModifier)
  console.log(deleteOneAvailabilityModifier)

  const handleDateClick = async (arg: DateClickApi) => {
    const isSameDateInput = (v: EventInput) => {
      if (v.start instanceof Date) {
        return v.start.getTime() === arg.date.getTime()
      }
      return v.start?.toString() === arg.date.toString()
    }

    if (calendarEvents.some(isSameDateInput)) {
      setCalendarEvents(
        calendarEvents.filter((v) => isSameDateInput(v) == false),
      )
    } else {
      setCalendarEvents(
        calendarEvents.concat({
          title: 'New Event',
          start: arg.date,
          end: moment(arg.date).add(30, 'minutes').toDate(),
          allDay: arg.allDay,
          rendering: 'background',
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

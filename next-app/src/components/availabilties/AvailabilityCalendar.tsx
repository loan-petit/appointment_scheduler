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
import Day from '../../models/enums/Day'
import getMaxId from '../../utils/getMaxId'
import isInBusinessHours, { BusinessHour } from '../../utils/isInBusinessHours'
import { convertSecondsToTimeString } from '../../utils/timeStringHelper'

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
    $isExclusive: Boolean!
    $userId: Int!
  ) {
    upsertOneAvailabilityModifier(
      create: {
        date: $date
        startTime: $startTime
        endTime: $endTime
        isExclusive: $endTime
        user: { connect: { id: $userId } }
      }
      update: {
        date: $date
        startTime: $startTime
        endTime: $endTime
        isExclusive: $isExclusive
      }
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
  const availabilityModifiers: AvailabilityModifier[] =
    data.user.availabilityModifiers

  console.log(availabilityModifiers)
  console.log(upsertOneAvailabilityModifier)
  console.log(deleteOneAvailabilityModifier)

  const businessHours: BusinessHour[] = recurrentAvailabilities
    .filter((v) => v.startTime && v.endTime)
    .map((v) => {
      if (!v.startTime || !v.endTime) {
        throw Error('RecurrentAvailabilities startTime and endTime must be set')
      }

      return {
        daysOfWeek: [Object.values(Day).indexOf(v.day)],
        startTime: convertSecondsToTimeString(v.startTime),
        endTime: convertSecondsToTimeString(v.endTime),
      }
    })

  const updateAvailabilityModifiers = async (arg: DateClickApi) => {
    const endTime = moment(arg.date).add(30, 'minutes')
    const isEventInBusinessHours = isInBusinessHours(
      {
        startTime: arg.date,
        endTime: moment(arg.date).add(30, 'minutes').toDate(),
        allDay: arg.allDay,
      },
      businessHours,
    )

    const atSameDate = availabilityModifiers.find(
      (v) =>
        v.isExclusive === isEventInBusinessHours &&
        moment(v.startTime).isSameOrBefore(arg.date) &&
        moment(v.endTime).isSameOrAfter(endTime),
    )
    const adjacent = availabilityModifiers.find(
      (v) =>
        v.isExclusive === isEventInBusinessHours &&
        (moment(v.startTime).isSame(endTime) ||
          moment(v.endTime).isSame(arg.date)),
    )

    if (atSameDate) {
      await upsertOneAvailabilityModifier({
        variables: {
          availabilityModifierId: atSameDate.id,
          startTime: atSameDate.startTime,
          endTime: arg.date,
          isExclusive: atSameDate.isExclusive,
          userId: currentUser.id,
        },
      })
      await upsertOneAvailabilityModifier({
        variables: {
          availabilityModifierId: atSameDate.id,
          startTime: endTime,
          endTime: atSameDate.endTime,
          isExclusive: atSameDate.isExclusive,
          userId: currentUser.id,
        },
      })
    } else if (adjacent) {
      await upsertOneAvailabilityModifier({
        variables: {
          availabilityModifierId: adjacent.id,
          startTime: moment(adjacent.startTime).isSame(endTime)
            ? arg.date
            : adjacent.startTime,
          endTime: moment(adjacent.endTime).isSame(arg.date)
            ? endTime
            : adjacent.endTime,
          isExclusive: adjacent.isExclusive,
          userId: currentUser.id,
        },
      })
    } else {
      await upsertOneAvailabilityModifier({
        variables: {
          availabilityModifierId: getMaxId(availabilityModifiers) + 1,
          startTime: arg.date,
          endTime: endTime,
          isExclusive: isEventInBusinessHours,
          userId: currentUser.id,
        },
      })
    }
  }
  console.log(updateAvailabilityModifiers)

  const handleDateClick = async (arg: DateClickApi) => {
    // await updateAvailabilityModifiers(arg)

    if (calendarEvents.some((v) => moment(v.start).isSame(arg.date))) {
      setCalendarEvents(
        calendarEvents.filter((v) => !moment(v.start).isSame(arg.date)),
      )
    } else {
      setCalendarEvents(
        calendarEvents.concat({
          title: getMaxId(availabilityModifiers).toString(),
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
        businessHours={businessHours}
      />
    </>
  )
}

export default AvailabilityCalendar

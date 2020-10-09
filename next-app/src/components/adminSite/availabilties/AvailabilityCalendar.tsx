import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { DateClickApi } from '@fullcalendar/core/Calendar'
import moment from 'moment'

import LoadingOverlay from '../../shared/LoadingOverlay'
import User from '../../../models/User'
import AvailabilityModifier, {
  AvailabilityModifierFragments,
  AvailabilityModifierOperations,
} from '../../../models/AvailabilityModifier'
import RecurrentAvailability from '../../../models/RecurrentAvailability'
import DynamicFullCalendar from '../../shared/fullCalendar/DynamicFullCalendar'
import Day from '../../../types/Day'
import isInBusinessHours, {
  BusinessHour,
} from '../../../utils/isInBusinessHours'
import { convertSecondsToTimeString } from '../../../utils/timeStringHelper'
import MomentInterval from '../../../types/MomentInterval'
import getSurroundingEvents from '../../../utils/getSurroundingEvents'
import isIntervalAllDay from '../../../utils/isIntervalAllDay'

const UpsertOneAvailabilityModifierMutation = gql`
  mutation UpsertOneAvailabilityModifierMutation(
    $availabilityModifierId: Int!
    $start: DateTime!
    $end: DateTime!
    $isExclusive: Boolean!
    $userId: Int!
  ) {
    upsertOneAvailabilityModifier(
      create: {
        start: $start
        end: $end
        isExclusive: $isExclusive
        user: { connect: { id: $userId } }
      }
      update: {
        start: { set: $start }
        end: { set: $end }
        isExclusive: { set: $isExclusive }
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
  // Hook to force component rerender
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const { loading, error, data } = useQuery(
    AvailabilityModifierOperations.availabilityModifiers,
    {
      variables: { userId: currentUser.id },
    },
  )

  const [upsertOneAvailabilityModifier] = useMutation(
    UpsertOneAvailabilityModifierMutation,
    {
      update(cache, { data: { upsertOneAvailabilityModifier } }) {
        const { user }: any = cache.readQuery({
          query: AvailabilityModifierOperations.availabilityModifiers,
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
          query: AvailabilityModifierOperations.availabilityModifiers,
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
          query: AvailabilityModifierOperations.availabilityModifiers,
          variables: { userId: currentUser?.id },
        })

        const removedAvailabilityModifierIndex = user.availabilityModifiers.findIndex(
          (e: AvailabilityModifier) => e.id == deleteOneAvailabilityModifier.id,
        )
        if (removedAvailabilityModifierIndex > -1) {
          user.availabilityModifiers.splice(removedAvailabilityModifierIndex, 1)
        }

        cache.writeQuery({
          query: AvailabilityModifierOperations.availabilityModifiers,
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

  // Verify AvailabilityModifiersQuery result
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

  const handleDateClick = async (arg: DateClickApi) => {
    var event: MomentInterval = {
      start: moment(arg.date),
      end: moment(arg.date).add(30, 'minutes'),
    }

    const isEventInBusinessHours = isInBusinessHours(event, businessHours)
    const surroundings = getSurroundingEvents(
      event,
      availabilityModifiers.map((v, i) => {
        return {
          index: i,
          interval: { start: moment(v.start), end: moment(v.end) },
        }
      }),
    )

    if (surroundings.equal.length) {
      surroundings.equal.forEach(
        async (v) =>
          await deleteOneAvailabilityModifier({
            variables: {
              availabilityModifierId: availabilityModifiers[v.index].id,
            },
          }),
      )
    } else {
      await upsertOneAvailabilityModifier({
        variables: {
          availabilityModifierId: -1,
          start: event.start,
          end: event.end,
          isExclusive: isEventInBusinessHours,
          userId: currentUser.id,
        },
      })
    }
    return forceUpdate()
  }

  return (
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
      nowIndicator={true}
      navLinks={true}
      allDaySlot={false}
      events={availabilityModifiers.map((v) => {
        const isAllDay = isIntervalAllDay(v.start, v.end)

        return {
          id: v.id,
          title: v.id,
          start: v.start,
          end: !isAllDay ? v.end : undefined,
          allDay: isAllDay,
          rendering: 'background',
          backgroundColor: v.isExclusive ? 'red' : 'green',
        }
      })}
      dateClick={handleDateClick}
      businessHours={businessHours}
    />
  )
}

export default AvailabilityCalendar

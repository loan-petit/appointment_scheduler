import React from 'react'
import DayPicker from 'react-day-picker'
import moment, { Moment } from 'moment'
import MomentLocaleUtils from 'react-day-picker/moment'

import User from '../../models/User'
import Event from '../../models/Event'
import RecurrentAvailability, {
  RecurrentAvailabilityOperations,
  RecurrentAvailabilityHelpers,
} from '../../models/RecurrentAvailability'
import AvailabilityModifier, {
  AvailabilityModifierOperations,
} from '../../models/AvailabilityModifier'
import { useQuery } from '@apollo/react-hooks'
import LoadingOverlay from '../shared/LoadingOverlay'
import Day from '../../types/Day'
import MomentInterval from '../../types/MomentInterval'
import { convertTimeStringToSeconds } from '../../utils/timeStringHelper'
import getSurroundingEvents, {
  IndexedMomentInterval,
} from '../../utils/getSurroundingEvents'

type Props = {
  user: User
  event: Event
}

const SelectDateTime: React.FunctionComponent<Props> = ({ user, event }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>()

  const recurrentAvailabilitiesQueryResult = useQuery(
    RecurrentAvailabilityOperations.recurrentAvailabilities,
    {
      variables: { userId: user?.id },
    },
  )
  const availabilityModifiersQueryResult = useQuery(
    AvailabilityModifierOperations.availabilityModifiers,
    {
      variables: { userId: user.id },
    },
  )

  // Verify RecurrentAvailabilitiesQuery result
  if (recurrentAvailabilitiesQueryResult.loading) return <LoadingOverlay />
  else if (recurrentAvailabilitiesQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!recurrentAvailabilitiesQueryResult.data) {
    return <div />
  }
  const recurrentAvailabilities: RecurrentAvailability[] =
    recurrentAvailabilitiesQueryResult.data.user.recurrentAvailabilities

  // Verify AvailabilityModifiersQuery result
  if (availabilityModifiersQueryResult.loading) return <LoadingOverlay />
  else if (availabilityModifiersQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  const availabilityModifiers: AvailabilityModifier[] = availabilityModifiersQueryResult.data.user.availabilityModifiers.filter(
    (v: AvailabilityModifier) => moment(v.start).isSameOrAfter(moment()),
  )

  const unavailableRecurrentDays = RecurrentAvailabilityHelpers.getMissingDays(
    recurrentAvailabilities,
  )

  const isDayAvailable = (date: Date) => {
    console.log(date)
    if (moment().isAfter(date)) return false

    const day: Day = moment(date).day()
    var exclusiveAvailabilityModifiersOnSameDay: AvailabilityModifier[] = []
    var isAvailable = false

    availabilityModifiers.forEach((v) => {
      if (moment(v.start).isSame(date, 'day')) {
        if (v.isExclusive) {
          exclusiveAvailabilityModifiersOnSameDay.push(v)
        } else {
          isAvailable = true
        }
      }
    })
    if (isAvailable) return isAvailable
    if (unavailableRecurrentDays.includes(day)) return false

    var availableTimes: MomentInterval[] = recurrentAvailabilities.reduce(
      (obj: MomentInterval[], v) => {
        if (!v.startTime || !v.endTime) return obj

        const dayIndex: Day = Object.values(Day).indexOf(v.day)

        if (dayIndex == day) {
          return obj.concat([
            {
              start: moment(v.startTime * 1000).utc(),
              end: moment(v.endTime * 1000).utc(),
            },
          ])
        }
        return obj
      },
      [],
    )

    var surroundings: IndexedMomentInterval[] = []

    availableTimes.forEach((availableTime) => {
      const groupedSurroundings = getSurroundingEvents(
        availableTime,
        exclusiveAvailabilityModifiersOnSameDay.map((v, i) => {
          const secondsFromStartOfEpoch = (date: Moment) => {
            return date.hour() * 3600 + date.minute() * 60 + date.second()
          }

          return {
            index: i,
            interval: {
              start: moment(
                secondsFromStartOfEpoch(moment(v.start)) * 1000,
              ).utc(),
              end: moment(secondsFromStartOfEpoch(moment(v.end)) * 1000).utc(),
            },
          }
        }),
      )

      surroundings = groupedSurroundings.equal
        .concat(groupedSurroundings.inclusive)
        .concat(groupedSurroundings.adjacent.inclusive.start)
        .concat(groupedSurroundings.adjacent.inclusive.end)
    })

    surroundings.forEach(({ interval }) => {
      availableTimes.forEach((v, i) => {
        if (
          v.start.isSameOrBefore(interval.start) &&
          v.end.isSameOrAfter(interval.end)
        ) {
          availableTimes.push({ start: interval.end, end: v.end })
          availableTimes[i].end = interval.start
        }
      })
    })

    return availableTimes.filter((v) => !v.start.isSame(v.end)).length !== 0
  }

  return (
    <>
      <h4 className="pb-6">Quand souhaitez-vous plannifier ce rendez-vous ?</h4>

      <div className="flex justify-center md:justify-start">
        <DayPicker
          localeUtils={MomentLocaleUtils}
          locale="fr"
          fromMonth={new Date()}
          selectedDays={selectedDate}
          disabledDays={(day) => !isDayAvailable(day)}
          onDayClick={(day, { selected }) =>
            selected ? setSelectedDate(undefined) : setSelectedDate(day)
          }
          className="border"
        />
      </div>
    </>
  )
}

export default SelectDateTime

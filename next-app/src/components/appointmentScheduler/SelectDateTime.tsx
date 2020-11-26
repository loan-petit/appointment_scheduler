import React from 'react'
import DayPicker from 'react-day-picker'
import moment, { Moment } from 'moment'
import MomentLocaleUtils from 'react-day-picker/moment'

import User from '../../models/User'
import AppointmentType from '../../models/AppointmentType'
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
import getSurroundingEvents, {
  IndexedMomentInterval,
} from '../../utils/getSurroundingEvents'

type Props = {
  user: User
  appointmentType: AppointmentType
  selectDateTime: (date: Date) => void
}

const SelectDateTime: React.FunctionComponent<Props> = ({
  user,
  appointmentType,
  selectDateTime,
}) => {
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

  const getAvailabilities = (date: Date) => {
    if (moment().isAfter(date)) return []

    const day: Day = moment(date).day()

    var availabilities: MomentInterval[] = []
    var exclusiveAvailabilities: AvailabilityModifier[] = []

    availabilityModifiers.forEach((v) => {
      if (moment(v.start).isSame(date, 'day')) {
        if (v.isExclusive) {
          exclusiveAvailabilities.push(v)
        } else {
          availabilities.push({ start: moment(v.start), end: moment(v.end) })
        }
      }
    })
    if (availabilities.length) return availabilities
    if (unavailableRecurrentDays.includes(day)) return []

    availabilities = availabilities.concat(
      RecurrentAvailabilityHelpers.atDay(recurrentAvailabilities, day),
    )

    var surroundings: IndexedMomentInterval[] = []

    availabilities.forEach((availability) => {
      const groupedSurroundings = getSurroundingEvents(
        availability,
        exclusiveAvailabilities.map((v, i) => {
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

      surroundings = surroundings
        .concat(groupedSurroundings.equal)
        .concat(groupedSurroundings.inclusive)
        .concat(groupedSurroundings.adjacent.inclusive.start)
        .concat(groupedSurroundings.adjacent.inclusive.end)
    })

    surroundings.forEach(({ interval }) => {
      availabilities.forEach((v, i) => {
        if (
          v.start.isSameOrBefore(interval.start) &&
          v.end.isSameOrAfter(interval.end)
        ) {
          availabilities.push({ start: interval.end, end: v.end })
          availabilities[i].end = interval.start
        }
      })
    })

    return availabilities.filter((v) => !v.start.isSame(v.end))
  }

  const splitAvailabilityInChunks = (
    availability: MomentInterval,
    minutes: number,
  ) => {
    const chunks: MomentInterval[] = [
      {
        start: availability.start.clone(),
        end: availability.start.clone().add(minutes, 'minutes'),
      },
    ]

    while (
      !chunks[chunks.length - 1].end
        .clone()
        .add(minutes, 'minutes')
        .isAfter(availability.end)
    ) {
      chunks.push({
        start: chunks[chunks.length - 1].end.clone(),
        end: chunks[chunks.length - 1].end.clone().add(minutes, 'minutes'),
      })
    }
    return chunks
  }

  var availabilityChunks: MomentInterval[] = []
  if (selectedDate) {
    availabilityChunks = getAvailabilities(selectedDate).reduce(
      (obj: MomentInterval[], v) => {
        return obj.concat(
          splitAvailabilityInChunks(v, appointmentType.duration),
        )
      },
      [],
    )
  }

  return (
    <>
      <h4 className="pb-6">Quand souhaitez-vous planifier ce rendez-vous ?</h4>

      <div className="flex flex-col items-center justify-center md:flex-row">
        <div className="flex justify-center w-full">
          <DayPicker
            localeUtils={MomentLocaleUtils}
            locale="fr"
            fromMonth={new Date()}
            selectedDays={selectedDate}
            disabledDays={(day) => getAvailabilities(day).length == 0}
            onDayClick={(day, { selected }) =>
              selected ? setSelectedDate(undefined) : setSelectedDate(day)
            }
            className="border rounded-lg"
          />
        </div>

        {selectedDate && (
          <div
            className={
              'flex flex-col w-full pr-2 mt-10 md:overflow-y-scroll md:mt-0 md:h-64' +
              (!availabilityChunks.length ? ' md:rounded-lg md:border' : '')
            }
          >
            {availabilityChunks.length ? (
              availabilityChunks.map((v, i) => {
                const slot = `${v.start.format('hh:mm')} - ${v.end.format(
                  'hh:mm',
                )}`

                return (
                  <div
                    key={i}
                    className="p-2 my-2 text-center text-gray-800 border rounded-lg cursor-pointer"
                    onClick={() =>
                      selectDateTime(
                        moment(selectedDate)
                          .hour(v.start.hours())
                          .minute(v.start.minutes())
                          .toDate(),
                      )
                    }
                  >
                    {slot}
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center w-full h-full text-center">
                <h6>Il n'y a pas de disponibilités à cette date</h6>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default SelectDateTime

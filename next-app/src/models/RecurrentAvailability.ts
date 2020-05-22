import gql from 'graphql-tag'

import User from './User'
import Day from './enums/Day'
import getMaxId from '../utils/getMaxId'

type RecurrentAvailability = {
  id: number
  day: string
  startTime?: number
  endTime?: number
  user?: User
}

export const RecurrentAvailabilityFragments = {
  fields: gql`
    fragment RecurrentAvailabilityFields on RecurrentAvailability {
      __typename
      id
      day
      startTime
      endTime
    }
  `,
}

export type RecurrentAvailabilitiesGroupedByDay = {
  [key in Day]?: RecurrentAvailability[]
}

export const RecurrentAvailabilityHelpers = {
  addMissingDays: (recurrentAvailabilities: RecurrentAvailability[]) => {
    var maxId = getMaxId(recurrentAvailabilities)

    Object.values(Day).forEach((day) => {
      if (typeof day === 'string') return
      if (recurrentAvailabilities.findIndex((e) => e.day == Day[day]) === -1) {
        maxId += 1
        recurrentAvailabilities.push({ id: maxId, day: Day[day] })
      }
    })
    return recurrentAvailabilities
  },
  groupByDay: (recurrentAvailabilities: RecurrentAvailability[]) =>
    recurrentAvailabilities.reduce(
      (obj: RecurrentAvailabilitiesGroupedByDay, v: RecurrentAvailability) => {
        const dayIndex: Day = Object.values(Day).indexOf(v.day)
        if (dayIndex == -1) return obj

        if (!obj[dayIndex]) obj[dayIndex] = []
        obj[dayIndex]?.push(v)
        return obj
      },
      {},
    ),
}

export default RecurrentAvailability

import gql from 'graphql-tag'
import moment from 'moment'

import User from './User'
import Day from '../types/Day'
import getMaxId from '../utils/getMaxId'
import MomentInterval from '../types/MomentInterval'

export type RecurrentAvailabilitiesGroupedByDay = {
  [key in Day]?: RecurrentAvailability[]
}

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

export const RecurrentAvailabilityOperations = {
  recurrentAvailabilities: gql`
    query RecurrentAvailabilitiesQuery($userId: Int!) {
      user(where: { id: $userId }) {
        recurrentAvailabilities {
          ...RecurrentAvailabilityFields
          user {
            __typename
          }
        }
      }
    }
    ${RecurrentAvailabilityFragments.fields}
  `,
  upsertOne: gql`
    mutation UpsertOneRecurrentAvailabilityMutation(
      $recurrentAvailabilityId: Int!
      $day: Day!
      $startTime: Int!
      $endTime: Int!
      $userId: Int!
    ) {
      upsertOneRecurrentAvailability(
        create: {
          day: $day
          startTime: $startTime
          endTime: $endTime
          user: { connect: { id: $userId } }
        }
        update: {
          day: { set: $day }
          startTime: { set: $startTime }
          endTime: { set: $endTime }
        }
        where: { id: $recurrentAvailabilityId }
      ) {
        ...RecurrentAvailabilityFields
      }
    }
    ${RecurrentAvailabilityFragments.fields}
  `,
  deleteOne: gql`
    mutation DeleteOneRecurrentAvailabilityMutation(
      $recurrentAvailabilityId: Int!
    ) {
      deleteOneRecurrentAvailability(where: { id: $recurrentAvailabilityId }) {
        ...RecurrentAvailabilityFields
      }
    }
    ${RecurrentAvailabilityFragments.fields}
  `,
}

export const RecurrentAvailabilityHelpers = {
  atDay: (recurrentAvailabilities: RecurrentAvailability[], day: Day) => {
    return recurrentAvailabilities.reduce((obj: MomentInterval[], v) => {
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
    }, [])
  },
  getMissingDays: (recurrentAvailabilities: RecurrentAvailability[]) => {
    const missingDays: Day[] = []

    Object.values(Day).forEach((day) => {
      if (typeof day === 'string') return
      if (recurrentAvailabilities.findIndex((e) => e.day == Day[day]) === -1) {
        missingDays.push(day)
      }
    })
    return missingDays
  },
  addMissingDays: (recurrentAvailabilities: RecurrentAvailability[]) => {
    var maxId = getMaxId(recurrentAvailabilities)

    RecurrentAvailabilityHelpers.getMissingDays(
      recurrentAvailabilities,
    ).forEach((v) => {
      maxId += 1
      recurrentAvailabilities.push({ id: maxId, day: Day[v] })
    })
    return recurrentAvailabilities
  },
  groupByDay: (recurrentAvailabilities: RecurrentAvailability[]) => {
    const grouped = recurrentAvailabilities.reduce(
      (obj: RecurrentAvailabilitiesGroupedByDay, v: RecurrentAvailability) => {
        const dayIndex: number = Object.values(Day).indexOf(v.day)
        if (dayIndex == -1) return obj

        const day: Day = dayIndex
        if (!obj[day]) obj[day] = []
        obj[day]?.push(v)
        return obj
      },
      {},
    )

    Object.values(Day).forEach((day) => {
      if (typeof day === 'string') return
      grouped[day]?.sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
    })
    return grouped
  },
}

export default RecurrentAvailability

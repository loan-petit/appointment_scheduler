import gql from 'graphql-tag'

import User from './User'

type RecurrentAvailabilitySlot = {
  id: number
  day: string
  startTime: number
  endTime: number
  user?: User
}

export const RecurrentAvailabilitySlotFragments = {
  fields: gql`
    fragment RecurrentAvailabilitySlotFields on RecurrentAvailabilitySlot {
      id
      day
      startTime
      endTime
      user
    }
  `,
}

export default RecurrentAvailabilitySlot

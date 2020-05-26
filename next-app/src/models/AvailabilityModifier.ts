import gql from 'graphql-tag'

import User from './User'

type AvailabilityModifier = {
  id: number
  date: string
  startTime: number
  endTime: number
  isExclusive: boolean
  user?: User
}

export const AvailabilityModifierFragments = {
  fields: gql`
    fragment AvailabilityModifierFields on AvailabilityModifier {
      __typename
      id
      date
      startTime
      endTime
      isExclusive
    }
  `,
}

export default AvailabilityModifier

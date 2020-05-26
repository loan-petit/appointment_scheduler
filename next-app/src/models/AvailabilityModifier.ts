import gql from 'graphql-tag'

import User from './User'

type AvailabilityModifier = {
  id: number
  start: Date
  end: Date
  isExclusive: boolean
  user?: User
}

export const AvailabilityModifierFragments = {
  fields: gql`
    fragment AvailabilityModifierFields on AvailabilityModifier {
      __typename
      id
      start
      end
      isExclusive
    }
  `,
}

export default AvailabilityModifier

import gql from 'graphql-tag'

import User from './User'

type Availability = {
  id: number
  date: string
  startTime?: number
  endTime?: number
  user?: User
}

export const AvailabilityFragments = {
  fields: gql`
    fragment AvailabilityFields on Availability {
      __typename
      id
      date
      startTime
      endTime
    }
  `,
}

export default Availability

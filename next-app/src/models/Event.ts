import gql from 'graphql-tag'

import User from './User'

type Event = {
  id: number
  name: string
  description?: string
  duration: number
  price?: number
  generateClientSheet?: boolean
  user: User
}

export const EventFragments = {
  fields: gql`
    fragment EventFields on Event {
      __typename
      id
      name
      description
      duration
      price
      generateClientSheet
    }
  `,
}

export const EventOperations = {
  events: gql`
    query EventsQuery($userId: Int!) {
      user(where: { id: $userId }) {
        __typename
        events {
          ...EventFields
        }
      }
    }
    ${EventFragments.fields}
  `,
}

export default Event

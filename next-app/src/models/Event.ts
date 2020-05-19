import gql from 'graphql-tag'

import User from './User'

type Event = {
  id: number
  name: string
  description?: string
  duration: number
  price?: number
  generateClientSheet?: boolean
  user?: User
}

export const EventFragments = {
  fields: gql`
    fragment EventFields on Event {
      id
      name
      description
      price
      generateClientSheet
      user
    }
  `,
}

export default Event

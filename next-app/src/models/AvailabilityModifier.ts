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

export const AvailabilityModifierOperations = {
  availabilityModifiers: gql`
    query AvailabilityModifiersQuery($userId: Int!) {
      user(where: { id: $userId }) {
        availabilityModifiers {
          ...AvailabilityModifierFields
        }
      }
    }
    ${AvailabilityModifierFragments.fields}
  `,
  upsertOne: gql`
    mutation UpsertOneAvailabilityModifierMutation(
      $availabilityModifierId: Int!
      $start: DateTime!
      $end: DateTime!
      $isExclusive: Boolean!
      $userId: Int!
    ) {
      upsertOneAvailabilityModifier(
        create: {
          start: $start
          end: $end
          isExclusive: $isExclusive
          user: { connect: { id: $userId } }
        }
        update: {
          start: { set: $start }
          end: { set: $end }
          isExclusive: { set: $isExclusive }
        }
        where: { id: $availabilityModifierId }
      ) {
        ...AvailabilityModifierFields
      }
    }
    ${AvailabilityModifierFragments.fields}
  `,
  deleteOne: gql`
    mutation DeleteOneAvailabilityModifierMutation(
      $availabilityModifierId: Int!
    ) {
      deleteOneAvailabilityModifier(where: { id: $availabilityModifierId }) {
        ...AvailabilityModifierFields
      }
    }
    ${AvailabilityModifierFragments.fields}
  `,
}

export default AvailabilityModifier

import { queryType } from '@nexus/schema'

export const DefaultQueries = queryType({
  definition (t) {
    t.crud.user()
    t.crud.users()

    t.crud.event()
    t.crud.events()

    t.crud.recurrentAvailability()
    t.crud.recurrentAvailabilities()

    t.crud.availabilityModifier()
    t.crud.availabilityModifiers()
  },
})

export * from './User'

import { queryType } from 'nexus'

export const DefaultQueries = queryType({
  definition(t) {
    t.crud.user()
    t.crud.users()

    t.crud.event()
    t.crud.events()

    t.crud.recurrentAvailability()
    t.crud.recurrentAvailabilities()

    t.crud.availability()
    t.crud.availabilities()
  },
})

export * from './User'

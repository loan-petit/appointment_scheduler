import { queryType } from 'nexus'

export const DefaultQueries = queryType({
  definition (t) {
    t.crud.user()
    t.crud.users()

    t.crud.event()
    t.crud.events()
  },
})

export * from './User'

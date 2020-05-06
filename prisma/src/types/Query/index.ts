import { queryType } from 'nexus'

export const DefaultQueries = queryType({
  definition (t) {
    t.crud.user()
    t.crud.users()
  }
})

export * from './User'

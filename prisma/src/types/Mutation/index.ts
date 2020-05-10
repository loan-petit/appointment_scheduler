import { mutationType } from 'nexus'

export const DefaultMutations = mutationType({
  definition (t) {
    t.crud.deleteOneUser()
  },
})

export * from './User'

import { mutationType } from 'nexus'

export const DefaultMutations = mutationType({
  definition (t) {
    t.crud.deleteOneUser()

    t.crud.createOneEvent()
    t.crud.updateOneEvent()
    t.crud.upsertOneEvent()
    t.crud.deleteOneEvent()

    t.crud.createOneRecurrentAvailability()
    t.crud.updateOneRecurrentAvailability()
    t.crud.upsertOneRecurrentAvailability()
    t.crud.deleteOneRecurrentAvailability()

    t.crud.createOneAvailability()
    t.crud.updateOneAvailability()
    t.crud.upsertOneAvailability()
    t.crud.deleteOneAvailability()
  },
})

export * from './User'

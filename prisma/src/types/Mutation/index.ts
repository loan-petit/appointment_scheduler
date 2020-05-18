import { mutationType } from 'nexus'

export const DefaultMutations = mutationType({
  definition (t) {
    t.crud.deleteOneUser()

    t.crud.createOneEvent()
    t.crud.updateOneEvent()
    t.crud.upsertOneEvent()
    t.crud.deleteOneEvent()

    t.crud.createOneAvailabilitySlot()
    t.crud.updateOneAvailabilitySlot()
    t.crud.upsertOneAvailabilitySlot()
    t.crud.deleteOneAvailabilitySlot()

    t.crud.createOneRecurrentAvailabilitySlot()
    t.crud.updateOneRecurrentAvailabilitySlot()
    t.crud.upsertOneRecurrentAvailabilitySlot()
    t.crud.deleteOneRecurrentAvailabilitySlot()
  },
})

export * from './User'

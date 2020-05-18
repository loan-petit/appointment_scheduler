import { queryType } from 'nexus'

export const DefaultQueries = queryType({
  definition(t) {
    t.crud.user()
    t.crud.users()

    t.crud.event()
    t.crud.events()

    t.crud.availabilitySlot()
    t.crud.availabilitySlots()

    t.crud.recurrentAvailabilitySlot()
    t.crud.recurrentAvailabilitySlot()
  },
})

export * from './User'

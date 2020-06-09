import { queryType } from '@nexus/schema'

export const DefaultQueries = queryType({
  definition (t) {
    t.crud.user()
    t.crud.users()

    t.crud.appointmentType()
    t.crud.appointmentTypes()

    t.crud.recurrentAvailability()
    t.crud.recurrentAvailabilities()

    t.crud.availabilityModifier()
    t.crud.availabilityModifiers()

    t.crud.customer()
    t.crud.customers()

    t.crud.appointment()
    t.crud.appointments()
  },
})

export * from './User'

import { mutationType } from '@nexus/schema'

export const DefaultMutations = mutationType({
  definition (t) {
    t.crud.deleteOneUser()

    t.crud.createOneAppointmentType()
    t.crud.updateOneAppointmentType()
    t.crud.upsertOneAppointmentType()
    t.crud.deleteOneAppointmentType()

    t.crud.createOneRecurrentAvailability()
    t.crud.updateOneRecurrentAvailability()
    t.crud.upsertOneRecurrentAvailability()
    t.crud.deleteOneRecurrentAvailability()

    t.crud.createOneAvailabilityModifier()
    t.crud.updateOneAvailabilityModifier()
    t.crud.upsertOneAvailabilityModifier()
    t.crud.deleteOneAvailabilityModifier()

    t.crud.createOneCustomer()
    t.crud.updateOneCustomer()
    t.crud.upsertOneCustomer()
    t.crud.deleteOneCustomer()

    t.crud.createOneAppointment()
    t.crud.updateOneAppointment()
    t.crud.deleteOneAppointment()
  },
})

export * from './User'

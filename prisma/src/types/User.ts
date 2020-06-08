import { objectType } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.password()
    t.model.username()
    t.model.firstName()
    t.model.lastName()
    t.model.websiteUrl()
    t.model.phone()
    t.model.address()
    t.model.minScheduleNotice()
    t.model.appointmentTypes({ pagination: false })
    t.model.recurrentAvailabilities({ pagination: false })
    t.model.availabilityModifiers({ pagination: false })
  },
})

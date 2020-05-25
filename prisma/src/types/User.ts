import { objectType } from 'nexus'

export const User = objectType({
  name: 'User',
  definition (t) {
    t.model.id()
    t.model.email()
    t.model.firstName()
    t.model.lastName()
    t.model.websiteUrl()
    t.model.address()
    t.model.minScheduleNotice()
    t.model.events({ pagination: false })
    t.model.recurrentAvailabilities({ pagination: false })
    t.model.availabilityModifiers({ pagination: false })
  },
})

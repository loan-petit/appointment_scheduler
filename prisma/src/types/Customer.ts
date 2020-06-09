import { objectType } from '@nexus/schema'

export const Customer = objectType({
  name: 'Customer',
  definition (t) {
    t.model.id()
    t.model.email()
    t.model.firstName()
    t.model.lastName()
    t.model.phone()
    t.model.address()
    t.model.isBlackListed()
    t.model.appointments({ pagination: false })
  },
})

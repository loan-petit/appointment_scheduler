import { objectType } from '@nexus/schema'

export const Event = objectType({
  name: 'Event',
  definition (t) {
    t.model.id()
    t.model.name()
    t.model.description()
    t.model.duration()
    t.model.price()
    t.model.generateClientSheet()
    t.model.user()
  },
})

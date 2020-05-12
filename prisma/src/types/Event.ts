import { objectType } from 'nexus'

export const Event = objectType({
  name: 'Event',
  definition (t) {
    t.model.id()
    t.model.name()
    t.model.description()
    t.model.duration()
    t.model.cost()
    t.model.generateClientSheet()
    t.model.owner()
  },
})

import { objectType } from '@nexus/schema'

export const RecurrentAvailability = objectType({
  name: 'RecurrentAvailability',
  definition (t) {
    t.model.id()
    t.model.day()
    t.model.startTime()
    t.model.endTime()
    t.model.user()
  },
})

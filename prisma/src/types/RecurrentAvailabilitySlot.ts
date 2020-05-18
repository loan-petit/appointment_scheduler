import { objectType } from 'nexus'

export const RecurrentAvailabilitySlot = objectType({
  name: 'RecurrentAvailabilitySlot',
  definition(t) {
    t.model.id()
    t.model.day()
    t.model.startTime()
    t.model.endTime()
    t.model.user()
  },
})

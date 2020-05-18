import { objectType } from 'nexus'

export const AvailabilitySlot = objectType({
  name: 'AvailabilitySlot',
  definition(t) {
    t.model.id()
    t.model.date()
    t.model.startTime()
    t.model.endTime()
    t.model.user()
  },
})

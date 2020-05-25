import { objectType } from 'nexus'

export const AvailabilityModifier = objectType({
  name: 'AvailabilityModifier',
  definition(t) {
    t.model.id()
    t.model.date()
    t.model.startTime()
    t.model.endTime()
    t.model.isExclusive()
    t.model.user()
  },
})

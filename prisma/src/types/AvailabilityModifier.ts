import { objectType } from '@nexus/schema'

export const AvailabilityModifier = objectType({
  name: 'AvailabilityModifier',
  definition (t) {
    t.model.id()
    t.model.start()
    t.model.end()
    t.model.isExclusive()
    t.model.user()
  },
})

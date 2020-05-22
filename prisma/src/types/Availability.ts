import { objectType } from 'nexus'

export const Availability = objectType({
  name: 'Availability',
  definition(t) {
    t.model.id()
    t.model.date()
    t.model.startTime()
    t.model.endTime()
    t.model.user()
  },
})

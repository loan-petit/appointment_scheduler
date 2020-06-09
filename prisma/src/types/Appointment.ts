import { objectType } from '@nexus/schema'

export const Appointment = objectType({
  name: 'Appointment',
  definition (t) {
    t.model.id()
    t.model.start()
    t.model.end()
    t.model.googleCalendarEventId()
    t.model.appointmentType()
    t.model.user()
    t.model.customer()
  },
})

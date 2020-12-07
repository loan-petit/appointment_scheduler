import User from '../User'
import Customer from '../Customer'
import AppointmentType from '../AppointmentType'

type Appointment = {
  id: number
  start: Date
  end: Date
  googleCalendarEventId?: boolean
  appointmentType?: AppointmentType
  user?: User
  customer?: Customer
}

export default Appointment

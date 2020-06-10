import React from 'react'
import moment from 'moment'

import Appointment from '../../models/Appointment'

type Props = {
  appointment: Appointment
}

const AppointmentDetails: React.FunctionComponent<Props> = ({
  appointment,
}) => (
  <div className="p-4 my-4 border-l-4 border-gray-800">
    <h4 className="font-bold">{appointment.appointmentType?.name}</h4>
    {appointment.appointmentType?.description ? (
      <p className="pt-2">{appointment.appointmentType.description}</p>
    ) : null}
    <p className="pt-2">
      Le {moment(appointment.start).format('dddd D MMMM YYYY')}, de{' '}
      {moment(appointment.start).format('hh[h]mm')} à{' '}
      {moment(appointment.end).format('hh[h]mm[.]')}
    </p>
    {appointment.appointmentType?.price ? (
      <p className="pt-2">Prix : {appointment.appointmentType.price}€</p>
    ) : null}
  </div>
)

export default AppointmentDetails

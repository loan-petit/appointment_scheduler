import React from 'react'

import AppointmentType from '../../../models/AppointmentType'
import User from '../../../models/User'
import AppointmentDetails from '../AppointmentDetails'
import Customer from '../../../models/Customer'
import Appointment from '../../../models/appointment/Appointment'

type Props = {
  user: User
  appointment: Appointment
  isIssuedByUser: boolean
  message?: string
}

const AppointmentCancellationForServiceProvider: React.FunctionComponent<Props> = ({
  user,
  appointment,
  isIssuedByUser,
  message,
}) => {
  const customer: Customer | undefined = appointment.customer
  const appointmentType: AppointmentType | undefined =
    appointment.appointmentType

  if (!customer || !appointmentType) {
    throw Error(
      'Appointment object is incomplete. Customer and appointmentType must be specified',
    )
  }

  return (
    <div className='p-8 text-gray-800'>
      <h2 className='text-xl font-semibold text-gray-900'>
        Bonjour {user.firstName} {user.lastName},
      </h2>
      <br />
      <p>
        Votre rendez-vous avec {customer.firstName} {customer.lastName} été
        annulé.
        <br />
        <br />
        Les détails de ce rendez-vous étaient les suivants :
      </p>

      <AppointmentDetails appointment={appointment} />

      {message && !isIssuedByUser && (
        <p>
          {customer.firstName} {customer.lastName} vous a laissé un message lors
          de l'annulation du rendez-vous :
          <br />"{message}"
        </p>
      )}
      <br />

      <p>
        Excellente journée à vous.
        <br />
        Cordialement.
      </p>
    </div>
  )
}

export default AppointmentCancellationForServiceProvider

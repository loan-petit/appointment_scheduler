import React from 'react'

import AppointmentType from '../../../models/AppointmentType'
import User from '../../../models/User'
import AppointmentDetails from '../AppointmentDetails'
import Customer from '../../../models/Customer'
import Appointment from '../../../models/Appointment'

type Props = {
  user: User
  appointment: Appointment
  message?: string
}

const AppointmentCancellationForServiceProvider: React.FunctionComponent<Props> = ({
  user,
  appointment,
  message,
}) => {
  const customer: Customer | undefined = appointment.customer
  const appointmentType: AppointmentType | undefined =
    appointment.appointmentType

  if (!customer || !appointmentType) {
    return (
      <>
        <h2 className='text-xl font-semibold text-gray-900'>Bonjour,</h2>
        <br />
        <p>
          Toute nous excuses, nous n'avons pas réussi à annuler votre
          rendez-vous. Veuillez réessayer.
          <br />
          Si le problème continue, veuillez contacter consulter le dossier de
          votre client et le contacter à l'aide des coordonnées qui y sont
          indiquées.
        </p>
        <br />
        <p>
          Excellente journée à vous.
          <br />
          Cordialement.
        </p>
      </>
    )
  }

  return (
    <div className='p-8 text-gray-800'>
      <h2 className='text-xl font-semibold text-gray-900'>
        Bonjour {user.firstName} {user.lastName},
      </h2>
      <br />
      <p>
        Vous venez d'annuler un rendez-vous avec {customer.firstName}{' '}
        {customer.lastName}.
        <br />
        Les détails de ce rendez-vous étaient les suivants :
      </p>

      <AppointmentDetails appointment={appointment} />

      {message && (
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

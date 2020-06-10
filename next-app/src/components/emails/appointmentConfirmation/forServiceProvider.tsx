import React from 'react'

import AppointmentType from '../../../models/AppointmentType'
import User from '../../../models/User'
import AppointmentDetails from '../AppointmentDetails'
import Customer from '../../../models/Customer'
import Appointment from '../../../models/Appointment'

type Props = {
  user: User
  appointment: Appointment
  message: string
}

const AppointmentConfirmationForServiceProvider: React.FunctionComponent<Props> = ({
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
        <h2 className="text-xl font-semibold text-gray-900">Bonjour,</h2>
        <br />
        <p>
          Toute nous excuses, un rendez-vous à été pris par un client mais nous
          ne parvenons pas à récupérer les informations de ce rendez-vous.
          Veuillez-vous connecter à votre compte pour retrouver ce rendez-vous.
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
    <div className="text-gray-800">
      <h2 className="text-xl font-semibold text-gray-900">
        Bonjour {user.firstName} {user.lastName},
      </h2>
      <br />
      <p>
        Un nouveau rendez-vous à été pris par {customer.firstName}{' '}
        {customer.lastName}.
      </p>

      <AppointmentDetails appointment={appointment} />

      <p>
        Un message vous a été laissé lorsque {customer.firstName}{' '}
        {customer.lastName} a pris son rendez-vous :
        <br />"{message}"
      </p>
      <br />

      <p>
        Vous souhaitez contacter {customer.firstName} {customer.lastName} ? Pas
        de soucis, voici ses coordonnées :
      </p>
      <div className="p-4 my-4 border-l-4 border-gray-900">
        <h4 className="font-bold">
          {customer.firstName} {customer.lastName}
        </h4>
        <p className="pt-2">
          E-mail :{' '}
          <a
            href={`mailto:${customer.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {customer.email}
          </a>
        </p>
        {customer.phone && <p className="pt-2">Téléphone : {customer.phone}</p>}
        {customer.address && (
          <p className="pt-2">Adresse postale : {customer.address}</p>
        )}
      </div>

      <p>
        Si vous souhaitez annuler ce rendez-vous, veuillez cliquez sur le lien
        suivant :
        <a
          href={`${process.env.SITE_URL}/appointments/cancelOne?id=${appointment.id}&username=${user.username}`}
          className="font-semibold text-gray-600 hover:text-gray-700"
        >
          Annuler le rendez-vous
        </a>
      </p>
      <br />

      <p>
        Excellente journée à vous.
        <br />
        Cordialement.
      </p>
    </div>
  )
}

export default AppointmentConfirmationForServiceProvider

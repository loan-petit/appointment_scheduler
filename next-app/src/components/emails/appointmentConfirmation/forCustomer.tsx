import React from 'react'

import AppointmentType from '../../../models/AppointmentType'
import User from '../../../models/User'
import AppointmentDetails from '../AppointmentDetails'
import Customer from '../../../models/Customer'
import Appointment from '../../../models/appointment/Appointment'

type Props = {
  user: User
  appointment: Appointment
}

const AppointmentConfirmationForCustomer: React.FunctionComponent<Props> = ({
  user,
  appointment,
}) => {
  const customer: Customer | undefined = appointment.customer
  const appointmentType: AppointmentType | undefined =
    appointment.appointmentType

  const userInformation = (
    <div className='p-4 my-4 border-l-4 border-gray-900'>
      <h4 className='font-bold'>
        {user.firstName} {user.lastName}
      </h4>
      <p className='pt-2'>
        E-mail :{' '}
        <a
          href={`mailto:${user.email}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {user.email}
        </a>
      </p>
      {user.websiteUrl && (
        <p className='pt-2'>
          Site web :{' '}
          <a href={user.websiteUrl} target='_blank' rel='noopener noreferrer'>
            {user.websiteUrl}
          </a>
        </p>
      )}
      {user.phone && <p className='pt-2'>Téléphone :{user.phone}</p>}
    </div>
  )

  if (!customer || !appointmentType) {
    return (
      <>
        <h2 className='text-xl font-semibold text-gray-900'>Bonjour,</h2>
        <br />
        <p>
          Toute nous excuses, nous n'avons pas réussi à planifier votre
          rendez-vous avec {user.firstName} {user.lastName}. Veuillez réessayer.
          <br />
          Si le problème continue, veuillez contacter {user.firstName}{' '}
          {user.lastName} aux coordonnées suivantes :
        </p>
        {userInformation}
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
    <div className='text-gray-800'>
      <h2 className='text-xl font-semibold text-gray-900'>
        Bonjour {customer.firstName} {customer.lastName},
      </h2>
      <br />
      <p>
        Vous venez de prendre rendez-vous avec {user.firstName} {user.lastName}.
      </p>

      <AppointmentDetails appointment={appointment} />

      <p>
        Vous souhaitez contacter {user.firstName} {user.lastName} ? Pas de
        soucis, voici ses coordonnées :
      </p>
      {userInformation}

      <p>
        Si vous souhaitez annuler ce rendez-vous, veuillez cliquez sur le lien
        suivant :{' '}
        <a
          href={`${process.env.SITE_URL}/appointments/cancelOne?id=${appointment.id}&username=${user.username}`}
          className='font-semibold text-gray-600 hover:text-gray-700'
        >
          Annuler le rendez-vous
        </a>
        .
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

export default AppointmentConfirmationForCustomer

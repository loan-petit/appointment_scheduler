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

const AppointmentCancellationForCustomer: React.FunctionComponent<Props> = ({
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
          rendez-vous avec {user.firstName} {user.lastName}. Veuillez réessayer.
          <br />
          Si le problème continue, veuillez contacter {user.firstName}{' '}
          {user.lastName} aux coordonnées suivantes :
        </p>
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
              <a
                href={user.websiteUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                {user.websiteUrl}
              </a>
            </p>
          )}
          {user.phone && <p className='pt-2'>Téléphone :{user.phone}</p>}
        </div>
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
        Bonjour {customer.firstName} {customer.lastName},
      </h2>
      <br />
      <p>
        Vous venez d'annuler un rendez-vous avec {user.firstName}{' '}
        {user.lastName}.
        <br />
        Les détails de ce rendez-vous étaient les suivants :
      </p>

      <AppointmentDetails appointment={appointment} />

      {message && (
        <p>
          {user.firstName} {user.lastName} vous a laissé un message lors de
          l'annulation du rendez-vous :
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

export default AppointmentCancellationForCustomer

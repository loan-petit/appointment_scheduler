import React from 'react'

import AppointmentType from '../../../models/AppointmentType'
import User from '../../../models/User'
import AppointmentDetails from './AppointmentDetails'
import Customer from '../../../types/Customer'

type Props = {
  customer: Customer
  user: User
  appointmentType: AppointmentType
  startDateTime: Date
}

const CustomerAppointmentConfirmation: React.FunctionComponent<Props> = ({
  customer,
  user,
  appointmentType,
  startDateTime,
}) => (
  <div className='p-8 text-gray-800'>
    <h2 className='text-xl font-semibold text-gray-900'>
      Bonjour {customer.firstName} {customer.lastName},
    </h2>
    <br />
    <p>
      Vous venez de prendre rendez-vous avec {user.firstName} {user.lastName}.
    </p>

    <AppointmentDetails
      appointmentType={appointmentType}
      startDateTime={startDateTime}
    />

    <p>
      Vous souhaitez contacter {user.firstName} {user.lastName} ? Pas de soucis,
      voici ses coordonnées :
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
          <a href={user.websiteUrl} target='_blank' rel='noopener noreferrer'>
            {user.websiteUrl}
          </a>
        </p>
      )}
      {user.phone && <p className='pt-2'>Téléphone :{user.phone}</p>}
    </div>

    <p>
      Excellente journée à vous.
      <br />
      Cordialement.
    </p>
  </div>
)

export default CustomerAppointmentConfirmation

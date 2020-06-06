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
  message: string
}

const ServiceProviderAppointmentConfirmation: React.FunctionComponent<Props> = ({
  customer,
  user,
  appointmentType,
  startDateTime,
  message,
}) => (
  <div className='p-8 text-gray-800'>
    <h2 className='text-xl font-semibold text-gray-900'>
      Bonjour {user.firstName} {user.lastName},
    </h2>
    <br />
    <p>
      Un nouveau rendez-vous à été pris par {customer.firstName}{' '}
      {customer.lastName}.
    </p>

    <AppointmentDetails
      appointmentType={appointmentType}
      startDateTime={startDateTime}
    />

    <p>
      Un message vous a été laissé lorsque {customer.firstName}{' '}
      {customer.lastName} a pris son rendez-vous :
      <br />"{message}"
    </p>
    <br />

    <p>
      Vous souhaitez contacter {customer.firstName} {customer.lastName} ? Pas de
      soucis, voici ses coordonnées :
    </p>
    <div className='p-4 my-4 border-l-4 border-gray-900'>
      <h4 className='font-bold'>
        {customer.firstName} {customer.lastName}
      </h4>
      <p className='pt-2'>
        E-mail :{' '}
        <a
          href={`mailto:${customer.email}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          {customer.email}
        </a>
      </p>
      {customer.phone && <p className='pt-2'>Téléphone : {customer.phone}</p>}
      {customer.address && (
        <p className='pt-2'>Adresse postale : {customer.address}</p>
      )}
    </div>

    <p>
      Excellente journée à vous.
      <br />
      Cordialement.
    </p>
  </div>
)

export default ServiceProviderAppointmentConfirmation

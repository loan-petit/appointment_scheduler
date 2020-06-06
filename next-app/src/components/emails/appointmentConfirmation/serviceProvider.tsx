import React from 'react'

import Event from '../../../models/Event'
import User from '../../../models/User'
import AppointmentDetails from './AppointmentDetails'

type Props = {
  customerDetails: { name: string; email: string }
  user: User
  event: Event
  startDateTime: Date
}

const ServiceProviderAppointmentConfirmation: React.FunctionComponent<Props> = ({
  customerDetails,
  user,
  event,
  startDateTime,
}) => (
  <div className="p-8 text-gray-800">
    <h2 className="text-xl font-semibold text-gray-900">
      Bonjour {user.firstName} {user.lastName},
    </h2>
    <br />
    <p>Un nouveau rendez-vous à été pris par {customerDetails.name}.</p>
    <br />

    <AppointmentDetails event={event} startDateTime={startDateTime} />

    <p>
      Vous souhaitez contacter {customerDetails.name} ? Pas de soucis, voici ses
      coordonées :
    </p>
    <div className="p-4 my-4 border-l-4 border-gray-900">
      <h4 className="font-bold">{customerDetails.name}</h4>
      <p className="pt-2">
        E-mail :{' '}
        <a
          href={`mailto:${customerDetails.email}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {customerDetails.email}
        </a>
      </p>
    </div>

    <p>
      Excellente journée à vous.
      <br />
      Cordialement.
    </p>
  </div>
)

export default ServiceProviderAppointmentConfirmation

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

const CustomerAppointmentConfirmation: React.FunctionComponent<Props> = ({
  customerDetails,
  user,
  event,
  startDateTime,
}) => (
  <div className="p-8 text-gray-800">
    <h2 className="text-xl font-semibold text-gray-900">
      Bonjour {customerDetails.name},
    </h2>
    <br />
    <p>
      Vous venez de prendre rendez-vous avec {user.firstName} {user.lastName}.
    </p>
    <br />

    <AppointmentDetails event={event} startDateTime={startDateTime} />

    <p>
      Vous souhaitez contacter {user.firstName} {user.lastName} ? Pas de soucis,
      voici ses coordonées :
    </p>
    <div className="p-4 my-4 border-l-4 border-gray-900">
      <h4 className="font-bold">
        {user.firstName} {user.lastName}
      </h4>
      <p className="pt-2">
        E-mail :{' '}
        <a
          href={`mailto:${user.email}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {user.email}
        </a>
      </p>
      {user?.websiteUrl && (
        <p className="pt-2">
          Site web :{' '}
          <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer">
            {user.websiteUrl}
          </a>
        </p>
      )}
    </div>

    <p>
      Excellente journée à vous.
      <br />
      Cordialement.
    </p>
  </div>
)

export default CustomerAppointmentConfirmation

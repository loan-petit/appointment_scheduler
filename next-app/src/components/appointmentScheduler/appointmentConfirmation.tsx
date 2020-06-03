import React from 'react'
import moment from 'moment'

import Event from '../../models/Event'

type Props = {
  event: Event
  dateTime: Date
  message: string
}

const AppointmentConfirmation: React.FunctionComponent<Props> = ({
  event,
  dateTime,
  message,
}) => (
  <p>
    Bonjour,
    <br />
    {message}
    <br />
    Voici les caractéristiques de ce rendez-vous:
    <li>Nom: {event.name}</li>
    <li>Description: {event.description}</li>
    <li>
      Le {moment(dateTime).format('D MMMM YYYY')} de{' '}
      {moment(dateTime).format('hh:mm')}h à{' '}
      {moment(dateTime).add(event.duration, 'minutes').format('hh:mm')}h.
    </li>
    {event.price && <li>Prix: {event.price}</li>}
  </p>
)

export default AppointmentConfirmation

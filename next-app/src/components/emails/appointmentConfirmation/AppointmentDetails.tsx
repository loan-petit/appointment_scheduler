import React from 'react'
import moment from 'moment'

import Event from '../../../models/Event'

type Props = {
  event: Event
  startDateTime: Date
}

const AppointmentDetails: React.FunctionComponent<Props> = ({
  event,
  startDateTime,
}) => (
  <div className="p-4 my-4 border-l-4 border-gray-800">
    <h4 className="font-bold">{event.name}</h4>
    {event.description ? <p className="pt-2">{event.description}</p> : null}
    <p className="pt-2">
      Le {moment(startDateTime).format('dddd D MMMM YYYY')}, de{' '}
      {moment(startDateTime).format('hh[h]mm')} à{' '}
      {moment(startDateTime)
        .add(event.duration, 'minutes')
        .format('hh[h]mm[.]')}
    </p>
    {event.price ? <p className="pt-2">Prix : {event.price}€</p> : null}
  </div>
)

export default AppointmentDetails

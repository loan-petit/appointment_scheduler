import React from 'react'
import moment from 'moment'

import AppointmentType from '../../../models/AppointmentType'

type Props = {
  appointmentType: AppointmentType
  startDateTime: Date
}

const AppointmentDetails: React.FunctionComponent<Props> = ({
  appointmentType,
  startDateTime,
}) => (
  <div className='p-4 my-4 border-l-4 border-gray-800'>
    <h4 className='font-bold'>{appointmentType.name}</h4>
    {appointmentType.description ? (
      <p className='pt-2'>{appointmentType.description}</p>
    ) : null}
    <p className='pt-2'>
      Le {moment(startDateTime).format('dddd D MMMM YYYY')}, de{' '}
      {moment(startDateTime).format('hh[h]mm')} à{' '}
      {moment(startDateTime)
        .add(appointmentType.duration, 'minutes')
        .format('hh[h]mm[.]')}
    </p>
    {appointmentType.price ? (
      <p className='pt-2'>Prix : {appointmentType.price}€</p>
    ) : null}
  </div>
)

export default AppointmentDetails

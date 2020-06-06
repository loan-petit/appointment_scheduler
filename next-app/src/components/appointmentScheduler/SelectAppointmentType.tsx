import React from 'react'

import AppointmentType from '../../models/AppointmentType'

type Props = {
  appointmentTypes: AppointmentType[]
  selectAppointmentType: (appointmentTypeId: number) => void
}

const SelectAppointmentType: React.FunctionComponent<Props> = ({
  appointmentTypes,
  selectAppointmentType,
}) => {
  return (
    <>
      <h4 className='pb-6'>Quel type de rendez-vous souhaitez-vous ?</h4>

      <div className='flex flex-wrap'>
        {appointmentTypes.map((appointmentType, i) => (
          <div
            key={i}
            className='flex justify-between w-full break-words bg-white border rounded-lg cursor-pointer md:w-4/12'
            onClick={() => selectAppointmentType(appointmentType.id)}
          >
            <div className='flex flex-col p-4 break-words'>
              <h4 className='text-xl font-semibold'>{appointmentType.name}</h4>
              <p className='mt-1 text-gray-600'>
                {appointmentType.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SelectAppointmentType

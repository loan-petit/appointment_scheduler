import React from 'react'

import Event from '../../models/Event'

type Props = {
  events: Event[]
  selectEvent: (eventId: number) => void
}

const SelectAppointmentType: React.FunctionComponent<Props> = ({
  events,
  selectEvent,
}) => {
  return (
    <>
      <h4 className='pb-6'>Quel type de rendez-vous souhaitez-vous ?</h4>

      <div className='flex flex-wrap'>
        {events.map((event, i) => (
          <div
            key={i}
            className='flex justify-between w-full break-words bg-white border rounded-lg cursor-pointer md:w-4/12'
            onClick={() => selectEvent(event.id)}
          >
            <div className='flex flex-col p-4 break-words'>
              <h4 className='text-xl font-semibold'>{event.name}</h4>
              <p className='mt-1 text-gray-600'>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SelectAppointmentType

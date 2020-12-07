import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

import Appointment from '../../models/appointment/Appointment'
import Router from 'next/router'

type Props = {
  appointment?: Appointment
  onClose: () => void
  useBackButton?: boolean
}

const AppointmentModal: React.FunctionComponent<Props> = ({
  appointment,
  onClose,
  useBackButton = false,
}) => {
  if (!appointment) return <div />

  return (
    <>
      {/* Background greyed out */}
      <div className='fixed inset-0 bg-gray-700 opacity-25' />

      {/* Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
        <div className='m-3 bg-white rounded-lg shadow-lg md:w-1/2'>
          <div
            className={
              'flex items-center px-5 py-4 border-b border-gray-200 ' +
              (useBackButton ? '' : 'justify-between')
            }
          >
            {useBackButton && (
              <div>
                <button onClick={onClose}>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className='mr-6 text-gray-800'
                  />
                </button>
              </div>
            )}
            <h4 className='text-xl font-semibold'>
              {appointment.appointmentType?.name}
            </h4>
            {!useBackButton && (
              <div>
                <button onClick={onClose}>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className='text-red-500 hover:text-red-600'
                  />
                </button>
              </div>
            )}
          </div>

          <div className='flex flex-col p-5'>
            <label className='text-sm'>Description</label>
            <p className='mt-1 text-gray-600'>
              {appointment.appointmentType?.description}
            </p>
            <br />

            <label className='text-sm'>Durée</label>
            <p className='mt-1 text-gray-600'>
              {appointment.appointmentType?.duration} minutes
            </p>
            <br />

            <label className='text-sm'>Prix</label>
            <p className='mt-1 text-gray-600'>
              {appointment.appointmentType?.price} €
            </p>
            <br />

            <label className='text-sm'>Nom du client</label>
            <p className='mt-1 text-gray-600'>
              {appointment.customer?.firstName} {appointment.customer?.lastName}
            </p>
          </div>

          <div className='flex justify-end p-4'>
            <button
              className='px-3 py-2 mr-1 text-sm text-white bg-red-500 rounded hover:bg-red-600'
              onClick={() =>
                Router.push(`/appointments/cancelOne?id=${appointment.id}`)
              }
            >
              Annuler le rendez-vous
            </button>
            <button
              className='px-3 py-2 text-sm font-semibold text-gray-800 transition duration-150 hover:text-gray-900'
              onClick={() =>
                Router.push(`/customers?id=${appointment.customer?.id}`)
              }
            >
              Voir la fiche client
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppointmentModal

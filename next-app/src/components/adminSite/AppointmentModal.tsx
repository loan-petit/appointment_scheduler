import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import Appointment from '../../models/Appointment'

type Props = {
  appointment: Appointment | undefined
  onClose: () => void
}

const AppointmentModal: React.FunctionComponent<Props> = ({
  appointment,
  onClose,
}) => {
  if (!appointment) return <div />

  return (
    <>
      {/* Background greyed out */}
      <div className="fixed inset-0 bg-gray-700 opacity-25" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="my-3 bg-white rounded-lg shadow-lg md:w-1/3 sm:w-full">
          <div className="flex justify-between px-5 py-4 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-700">
              {appointment.appointmentType?.name}
            </span>
            <div>
              <button onClick={onClose}>
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="text-red-500 hover:text-red-600"
                />
              </button>
            </div>
          </div>

          <div className="px-10 py-5 text-gray-600">Hello</div>
        </div>
      </div>
    </>
  )
}

export default AppointmentModal

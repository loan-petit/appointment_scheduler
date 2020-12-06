import * as React from 'react'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle,
  faEnvelope,
  faPhoneAlt,
  faMapMarkerAlt,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons'

import Customer from '../../models/Customer'
import Appointment, { AppointmentOperations } from '../../models/Appointment'
import { useQuery } from '@apollo/react-hooks'
import LoadingOverlay from '../shared/LoadingOverlay'
import AppointmentModal from './AppointmentModal'

type Props = {
  customer?: Customer
  onClose: () => void
}

const CustomerModal: React.FunctionComponent<Props> = ({
  customer,
  onClose,
}) => {
  if (!customer) return <div />

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] = React.useState<Appointment>()

  const appointmentsQueryResult = useQuery(
    AppointmentOperations.appointmentsForCustomer,
    {
      variables: { customerId: customer.id },
    },
  )

  // Verify CustomersQuery result
  if (appointmentsQueryResult.loading) return <LoadingOverlay />
  else if (appointmentsQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!appointmentsQueryResult.data) {
    return <div />
  }
  const appointments: Appointment[] =
    appointmentsQueryResult.data.customer.appointments

  return (
    <>
      {/* Background greyed out */}
      <div className="fixed inset-0 bg-gray-700 opacity-25" />

      {/* Modal */}
      {!selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="my-3 bg-white rounded-lg shadow-lg md:w-1/4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-xl font-semibold">
                {customer.firstName} {customer.lastName}
              </h4>
              <div>
                <button onClick={onClose}>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="text-red-500 hover:text-red-600"
                  />
                </button>
              </div>
            </div>

            <div className="px-8 py-2">
              <h3 className="mb-4 text-4xl font-semibold leading-normal text-gray-800"></h3>

              <div className="my-4 text-gray-700">
                <label className="block mb-2">E-mail</label>
                <FontAwesomeIcon icon={faEnvelope} className="mr-4" />
                {customer.email}
              </div>

              <div className="my-4 text-gray-700">
                <label className="block mb-2">Téléphone</label>
                <FontAwesomeIcon icon={faPhoneAlt} className="mr-4" />
                {customer.phone}
              </div>

              <div className="my-4 text-gray-700">
                <label className="block mb-2">Adresse</label>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-4" />
                {customer.address}
              </div>

              <div className="mt-6 mb-4 text-gray-700">
                <h5 className="block mb-4 text-center">
                  {appointments.length
                    ? 'Rendez-vous'
                    : "Vous n'avez pas de rendez-vous avec cette personne"}
                </h5>
                <div className="flex flex-col h-64 overflow-y-auto md:h-96">
                  {appointments.map((appointment, i) => (
                    <div key={i}>
                      <div
                        className="flex flex-row items-center pl-2 break-words cursor-pointer"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <FontAwesomeIcon icon={faAngleRight} className="mr-4" />
                        <p className="text-gray-700">
                          <b>
                            {appointment.appointmentType?.name}
                            {'  '}
                          </b>
                          {moment(appointment.start).format(
                            '[- Le ]d/MM[ à ]HH:MM',
                          )}
                        </p>
                      </div>

                      {i !== appointments.length - 1 && (
                        <hr className="my-4 border-b-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AppointmentModal
        appointment={
          selectedAppointment
            ? { ...selectedAppointment, customer: customer }
            : undefined
        }
        onClose={() => setSelectedAppointment(undefined)}
        useBackButton={true}
      />
    </>
  )
}

export default CustomerModal

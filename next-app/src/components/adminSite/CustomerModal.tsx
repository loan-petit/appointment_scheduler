import * as React from 'react'
import gql from 'graphql-tag'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle,
  faEnvelope,
  faPhoneAlt,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons'

import Customer from '../../models/Customer'
import Appointment, { AppointmentFragments } from '../../models/Appointment'
import { AppointmentTypeFragments } from '../../models/AppointmentType'
import { useQuery } from '@apollo/react-hooks'
import LoadingOverlay from '../shared/LoadingOverlay'

const AppointmentsQuery = gql`
  query AppointmentsQuery($customerId: Int!) {
    customer(where: { id: $customerId }) {
      appointments {
        ...AppointmentFields
        appointmentType {
          ...AppointmentTypeFields
        }
      }
    }
  }
  ${AppointmentFragments.fields}
  ${AppointmentTypeFragments.fields}
`

type Props = {
  customer?: Customer
  onClose: () => void
}

const CustomerModal: React.FunctionComponent<Props> = ({
  customer,
  onClose,
}) => {
  if (!customer) return <div />

  const appointmentsQueryResult = useQuery(AppointmentsQuery, {
    variables: { customerId: customer.id },
  })

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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="my-3 bg-white rounded-lg shadow-lg">
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
          </div>

          {appointments.map((appointment, i) => (
            <div key={i}>
              <div className="flex flex-row items-center break-words cursor-pointer">
                <p className="flex-1 hidden text-center md:block">
                  {appointment.appointmentType?.name}
                </p>
              </div>

              {i !== appointments.length - 1 && (
                <hr className="my-4 border-b-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default CustomerModal

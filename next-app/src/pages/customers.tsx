import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/shared/LoadingOverlay'
import User from '../models/User'
import Layout from '../components/adminSite/Layout'
import Customer, { CustomerFragments } from '../models/Customer'
import { AppointmentFragments } from '../models/Appointment'
import {
  faMapMarkerAlt,
  faPhone,
  faPhoneAlt,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`

const CustomersQuery = gql`
  query CustomersQuery($userId: Int!) {
    user(where: { id: $userId }) {
      customers {
        ...CustomerFields
        appointments {
          ...AppointmentFields
        }
      }
    }
  }
  ${CustomerFragments.fields}
  ${AppointmentFragments.fields}
`

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer>()

  const [currentUser, setCurrentUser] = React.useState<User>()

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const customersQueryResult = useQuery(CustomersQuery, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  })

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  else if (currentUserQueryResult.error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
    return <div />
  }

  // Verify CustomersQuery result
  if (customersQueryResult.loading) return <LoadingOverlay />
  else if (customersQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!customersQueryResult.data) {
    return <div />
  }
  const customers: Customer[] = customersQueryResult.data.user.customers

  return (
    <Layout
      backButtonCallback={
        selectedCustomer ? () => setSelectedCustomer(undefined) : undefined
      }
    >
      <div className="flex flex-row">
        <div
          className={
            (selectedCustomer ? 'hidden ' : '') +
            'md:block md:w-1/3 md:overflow-auto md:border-r-2'
          }
        >
          {customers.map((customer, i) => (
            <>
              <div
                key={i}
                className="p-4 break-words cursor-pointer"
                onClick={() =>
                  !selectedCustomer
                    ? setSelectedCustomer(customer)
                    : setSelectedCustomer(undefined)
                }
              >
                <h4 className="text-xl font-semibold">
                  {customer.firstName} {customer.lastName}
                </h4>
                <p className="mt-1 text-gray-600">{customer.email}</p>
              </div>

              {i !== customers.length - 1 && <hr className="my-6 border-b-1" />}
            </>
          ))}
        </div>

        {selectedCustomer && (
          <div className="p-4 text-center md:w-2/3">
            <h3 className="mb-4 text-4xl font-semibold leading-normal text-gray-800">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </h3>
            <div className="mb-2 text-gray-700">
              <FontAwesomeIcon icon={faEnvelope} className="mr-4" />
              {selectedCustomer.email}
            </div>
            <div className="mb-2 text-gray-700">
              <FontAwesomeIcon icon={faPhoneAlt} className="mr-4" />
              {selectedCustomer.phone}
            </div>
            <div className="mb-2 text-gray-700">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-4" />
              {selectedCustomer.address}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default withApollo(Customers)

import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import Avatar from 'react-avatar'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/shared/LoadingOverlay'
import User from '../models/User'
import Layout from '../components/adminSite/Layout'
import Customer, { CustomerFragments } from '../models/Customer'
import { AppointmentFragments } from '../models/Appointment'
import CustomerModal from '../components/adminSite/CustomerModal'

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
      <p className='error-message'>
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
      <h5 className='mb-8'>Vos contacts</h5>

      {customers.length ? (
        <>
          <div className='flex-row hidden mb-8 md:flex'>
            <label className='flex-1 text-center'>Nom complet</label>
            <label className='flex-1 text-center'>E-mail</label>
            <label className='flex-1 text-center'>Téléphone</label>
            <label className='flex-1 text-center'>Adresse</label>
          </div>

          {customers.map((customer, i) => (
            <div key={i}>
              <div
                className='flex flex-row items-center break-words cursor-pointer'
                onClick={() =>
                  !selectedCustomer
                    ? setSelectedCustomer(customer)
                    : setSelectedCustomer(undefined)
                }
              >
                <div className='flex flex-row items-center flex-1 md:justify-center'>
                  <Avatar
                    name={`${customer.firstName} ${customer.lastName}`}
                    size='60'
                    round={true}
                    className='mr-6'
                  />
                  <h4 className='text-xl font-semibold'>
                    {customer.firstName} {customer.lastName}
                  </h4>
                </div>

                <p className='flex-1 hidden text-center md:block'>
                  {customer.email}
                </p>
                <p className='flex-1 hidden text-center md:block'>
                  {customer.phone}
                </p>
                <p className='flex-1 hidden text-center md:block'>
                  {customer.address}
                </p>
              </div>

              {i !== customers.length - 1 && <hr className='my-4 border-b-1' />}
            </div>
          ))}
        </>
      ) : (
        <h6>Vous n'avez pas encore de contacts</h6>
      )}

      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(undefined)}
      />
    </Layout>
  )
}

export default withApollo(Customers)

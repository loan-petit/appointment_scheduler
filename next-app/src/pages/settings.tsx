import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/LoadingOverlay'
import Layout from '../components/Layout'
import UpdateInformations from '../components/settings/UpdateInformations'
import UpdatePassword from '../components/settings/UpdatePassword'
import User from '../models/User'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`

const Settings = () => {
  const { loading, error, data } = useQuery(CurrentUserQuery)

  // Verify CurrentUserQuery result
  if (loading) return <LoadingOverlay />
  else if (error) {
    Router.push('/auth/signin')
    return <div />
  }
  const currentUser: User = data.me.user

  return (
    <Layout>
      <section>
        <header className="flex items-center mb-8">
          <h5>Vos informations</h5>
        </header>

        <div className="md:w-1/2">
          <UpdateInformations currentUser={currentUser} />
        </div>
      </section>

      <hr className="my-12 border-b-1" />

      <section>
        <header className="flex items-center mb-8">
          <h5>Changer votre mot de passe</h5>
        </header>

        <div className="md:w-1/2">
          <UpdatePassword />
        </div>
      </section>
    </Layout>
  )
}

export default withApollo(Settings)

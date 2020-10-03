import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/shared/LoadingOverlay'
import Layout from '../components/adminSite/Layout'
import UpdateInformations from '../components/adminSite/settings/UpdateInformations'
import UpdatePassword from '../components/adminSite/settings/UpdatePassword'
import User, { UserFragments } from '../models/User'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        ...UserFields
      }
    }
  }
  ${UserFragments.fields}
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

      {currentUser.password && (
        <section>
          <header className="flex items-center mb-8">
            <h5>Changer votre mot de passe</h5>
          </header>

          <div className="md:w-1/2">
            <UpdatePassword />
          </div>
        </section>
      )}
    </Layout>
  )
}

export default withApollo(Settings)

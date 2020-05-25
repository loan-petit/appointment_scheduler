import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/LoadingOverlay'
import User from '../models/User'
import Layout from '../components/Layout'
import UpdateInformations from '../components/settings/UpdateInformations'
import UpdatePassword from '../components/settings/UpdatePassword'

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
  const [currentUser, setCurrentUser] = React.useState<User>()

  const { loading, error, data } = useQuery(CurrentUserQuery)

  // Verify CurrentUserQuery result
  if (loading) return <LoadingOverlay />
  else if (error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(data.me.user)
    return <div />
  }

  return (
    <Layout>
      <div className="md:w-1/2">
        <UpdateInformations currentUser={currentUser} />

        <hr className="my-12 border-b-1" />

        <UpdatePassword />
      </div>
    </Layout>
  )
}

export default withApollo(Settings)

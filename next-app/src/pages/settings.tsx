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
import AvailabilityCalendar from '../components/settings/availabilties/AvailabilityCalendar'
import RecurrentAvailability, {
  RecurrentAvailabilityOperations,
} from '../models/RecurrentAvailability'
import UpsertRecurrentAvailabilities from '../components/settings/recurrentAvailability/UpsertRecurrentAvailaibilities'

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

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const recurrentAvailabilitiesQueryResult = useQuery(
    RecurrentAvailabilityOperations.recurrentAvailabilities,
    {
      variables: { userId: currentUser?.id },
      skip: !currentUser,
    },
  )

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

  // Verify RecurrentAvailabilitiesQuery result
  if (recurrentAvailabilitiesQueryResult.loading) return <LoadingOverlay />
  else if (recurrentAvailabilitiesQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!recurrentAvailabilitiesQueryResult.data) {
    return <div />
  }
  const recurrentAvailabilities: RecurrentAvailability[] =
    recurrentAvailabilitiesQueryResult.data.user.recurrentAvailabilities

  return (
    <Layout>
      <div className="md:w-1/2">
        <AvailabilityCalendar currentUser={currentUser} 
          recurrentAvailabilities={recurrentAvailabilities}
        />

        <hr className="my-12 border-b-1" />

        <UpdateInformations currentUser={currentUser} />

        <hr className="my-12 border-b-1" />

        <UpsertRecurrentAvailabilities
          currentUser={currentUser}
          recurrentAvailabilities={recurrentAvailabilities}
        />

        <hr className="my-12 border-b-1" />

        <UpdatePassword />
      </div>
    </Layout>
  )
}

export default withApollo(Settings)

import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/LoadingOverlay'
import User from '../models/User'
import Layout from '../components/Layout'
import RecurrentAvailability, {
  RecurrentAvailabilityOperations,
} from '../models/RecurrentAvailability'
import UpsertRecurrentAvailabilities from '../components/availabilties/recurrentAvailability/UpsertRecurrentAvailaibilities'
import AvailabilityCalendar from '../components/availabilties/AvailabilityCalendar'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`

const Availabilities = () => {
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
      <AvailabilityCalendar
        currentUser={currentUser}
        recurrentAvailabilities={recurrentAvailabilities}
      />

      <hr className="my-12 border-b-1" />

      <UpsertRecurrentAvailabilities
        currentUser={currentUser}
        recurrentAvailabilities={recurrentAvailabilities}
      />
    </Layout>
  )
}

export default withApollo(Availabilities)

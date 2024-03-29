import React from 'react'
import Router from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/shared/LoadingOverlay'
import User, { UserOperations } from '../models/User'
import Layout from '../components/adminSite/Layout'
import RecurrentAvailability, {
  RecurrentAvailabilityOperations,
} from '../models/RecurrentAvailability'
import UpsertRecurrentAvailabilities from '../components/adminSite/availabilties/recurrentAvailability/UpsertRecurrentAvailaibilities'
import AvailabilityCalendar from '../components/adminSite/availabilties/AvailabilityCalendar'

const Availabilities = () => {
  const [
    isAvailabilityCalendarShown,
    setIsAvailabilityCalendarShown,
  ] = React.useState<boolean>(false)
  const [
    areRecurrentAvailabilitiesShown,
    setAreRecurrentAvailabilitiesShown,
  ] = React.useState<boolean>(false)

  const [currentUser, setCurrentUser] = React.useState<User>()

  const currentUserQueryResult = useQuery(UserOperations.currentUserIdOnly)
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
      <p className='error-message'>
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
      <section>
        <header
          className='flex items-center mb-6 cursor-pointer'
          onClick={() =>
            setAreRecurrentAvailabilitiesShown(!areRecurrentAvailabilitiesShown)
          }
        >
          <FontAwesomeIcon
            icon={areRecurrentAvailabilitiesShown ? faAngleDown : faAngleRight}
            size='lg'
            className='text-gray-600'
          />
          <h5 className='pl-6'>Définir vos disponibilitées par défaut</h5>
        </header>

        <div
          className={
            'md:w-1/2 ' + (areRecurrentAvailabilitiesShown ? '' : 'hidden')
          }
        >
          <UpsertRecurrentAvailabilities
            currentUser={currentUser}
            recurrentAvailabilities={recurrentAvailabilities}
          />
        </div>
      </section>

      <hr className='my-12 border-b-1' />

      <section>
        <header
          className='flex items-center mb-6 cursor-pointer'
          onClick={() =>
            setIsAvailabilityCalendarShown(!isAvailabilityCalendarShown)
          }
        >
          <FontAwesomeIcon
            icon={isAvailabilityCalendarShown ? faAngleDown : faAngleRight}
            size='lg'
            className='text-gray-600'
          />
          <h5 className='pl-6'>Calendrier de vos disponibilités</h5>
        </header>

        {isAvailabilityCalendarShown && (
          <AvailabilityCalendar
            currentUser={currentUser}
            recurrentAvailabilities={recurrentAvailabilities}
          />
        )}
      </section>
    </Layout>
  )
}

export default withApollo(Availabilities)

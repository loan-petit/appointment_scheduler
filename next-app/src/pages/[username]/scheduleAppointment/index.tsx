import React from 'react'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

import { withApollo } from '../../../apollo/client'
import ContactInformation from '../../../components/appointmentScheduler/ContactInformation'
import LoadingOverlay from '../../../components/shared/LoadingOverlay'
import User, { UserFragments } from '../../../models/User'
import AppointmentType, {
  AppointmentTypeOperations,
} from '../../../models/AppointmentType'
import Layout from '../../../components/appointmentScheduler/Layout'
import SelectAppointmentType from '../../../components/appointmentScheduler/SelectAppointmentType'
import SelectDateTime from '../../../components/appointmentScheduler/SelectDateTime'

const UserQuery = gql`
  query UserQuery($username: String!) {
    user(where: { username: $username }) {
      ...UserFields
    }
  }
  ${UserFragments.fields}
`

const AppointmentScheduler = () => {
  const router = useRouter()

  const [selectedAppointmentType, setSelectedAppointmentType] = React.useState<
    AppointmentType
  >()
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date>()

  var [user, setUser] = React.useState<User>()
  const userQueryResult = useQuery(UserQuery, {
    variables: {
      username: router.query.username,
    },
  })

  const appointmentTypesQueryResult = useQuery(
    AppointmentTypeOperations.appointmentTypes,
    {
      variables: { userId: user?.id },
      skip: !user,
    },
  )

  // Verify UserQuery result
  if (userQueryResult.loading) return <LoadingOverlay />
  else if (userQueryResult.error) {
    return (
      <p className='error-message'>
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  if (!user) {
    setUser(userQueryResult.data.user)
  }

  // Verify AppointmentTypesQuery result
  if (appointmentTypesQueryResult.loading) return <LoadingOverlay />
  else if (appointmentTypesQueryResult.error) {
    return (
      <p className='error-message'>
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!appointmentTypesQueryResult.data) {
    return <div />
  }
  const appointmentTypes: AppointmentType[] =
    appointmentTypesQueryResult.data.user.appointmentTypes

  return (
    <Layout user={user}>
      {!selectedAppointmentType && (
        <SelectAppointmentType
          appointmentTypes={appointmentTypes}
          selectAppointmentType={(appointmentTypeId: number) =>
            setSelectedAppointmentType(
              appointmentTypes.find(v => v.id == appointmentTypeId),
            )
          }
        />
      )}
      {user && selectedAppointmentType && !selectedDateTime && (
        <SelectDateTime
          user={user}
          appointmentType={selectedAppointmentType}
          selectDateTime={setSelectedDateTime}
        />
      )}
      {user && selectedAppointmentType && selectedDateTime && (
        <ContactInformation
          user={user}
          appointmentType={selectedAppointmentType}
          startDateTime={selectedDateTime}
        />
      )}
    </Layout>
  )
}

export default withApollo(AppointmentScheduler)

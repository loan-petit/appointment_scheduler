import * as React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Router from 'next/router'

import LoadingOverlay from '../../components/shared/LoadingOverlay'
import User from '../../models/User'
import AppointmentType, {
  AppointmentTypeFragments,
  AppointmentTypeOperations,
} from '../../models/AppointmentType'
import { withApollo } from '../../apollo/client'
import Layout from '../../components/adminSite/Layout'
import WarningModal from '../../components/shared/WarningModal'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`
const DeleteOneAppointmentTypeMutation = gql`
  mutation DeleteOneAppointmentTypeMutation($appointmentTypeId: Int!) {
    deleteOneAppointmentType(where: { id: $appointmentTypeId }) {
      ...AppointmentTypeFields
    }
  }
  ${AppointmentTypeFragments.fields}
`

const AppointmentTypes = () => {
  const [currentUser, setCurrentUser] = React.useState<User>()

  const [
    isAppointmentTypeDetailsOpen,
    setIsAppointmentTypeDetailsOpen,
  ] = React.useState<boolean[]>()
  const [
    appointmentTypeToDeleteId,
    setAppointmentTypeToDeleteId,
  ] = React.useState(-1)

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const appointmentTypesQueryResult = useQuery(
    AppointmentTypeOperations.appointmentTypes,
    {
      variables: { userId: currentUser?.id },
      skip: !currentUser,
    },
  )
  const [deleteOneAppointmentType] = useMutation(
    DeleteOneAppointmentTypeMutation,
    {
      update(cache, { data: { deleteOneAppointmentType } }) {
        const { user }: any = cache.readQuery({
          query: AppointmentTypeOperations.appointmentTypes,
          variables: { userId: currentUser?.id },
        })

        const removedAppointmentTypeIndex = user.appointmentTypes.findIndex(
          (e: AppointmentType) => e.id == deleteOneAppointmentType.id,
        )
        if (removedAppointmentTypeIndex > -1) {
          user.appointmentTypes.splice(removedAppointmentTypeIndex, 1)
        }

        cache.writeQuery({
          query: AppointmentTypeOperations.appointmentTypes,
          variables: { userId: currentUser?.id },
          data: {
            __typename: 'User',
            user: {
              ...user,
              appointmentTypes: user.appointmentTypes,
            },
          },
        })
      },
    },
  )

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  else if (currentUserQueryResult.error) {
    console.log(currentUserQueryResult.error)
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
  }

  // Verify AppointmentTypesQuery result
  if (appointmentTypesQueryResult.loading) return <LoadingOverlay />
  else if (appointmentTypesQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  } else if (!appointmentTypesQueryResult.data) {
    return <div />
  }
  const appointmentTypes: AppointmentType[] =
    appointmentTypesQueryResult.data.user.appointmentTypes

  return (
    <Layout>
      <div className="flex justify-center pb-2">
        <Link href="/appointmentTypes/upsertOne">
          <a className="flex flex-row items-center justify-center py-4 rounded-lg lg:w-1/2 hover:bg-gray-300">
            <FontAwesomeIcon icon={faPlus} />
            <p className="pl-4 text-lg">Créer un nouvel événement</p>
          </a>
        </Link>
      </div>

      {/* AppointmentTypes */}
      <div className="flex flex-wrap">
        {appointmentTypes.map((appointmentType, i) => (
          <div
            key={i}
            className="flex justify-between w-full m-4 text-gray-800 bg-white rounded-lg shadow-lg md:w-4/12"
          >
            <div className="flex flex-col p-4 break-words">
              <h4 className="text-xl font-semibold">{appointmentType.name}</h4>
              <p className="mt-1 text-gray-600">
                {appointmentType.description}
              </p>
            </div>

            <div className="relative m-4">
              <FontAwesomeIcon
                icon={faEllipsisH}
                onClick={() =>
                  setIsAppointmentTypeDetailsOpen(
                    (
                      isAppointmentTypeDetailsOpen ||
                      new Array(appointmentTypes.length).fill(false)
                    ).map((x, j) => (i == j ? !x : false)),
                  )
                }
                className="cursor-pointer"
              />
              <div
                className={
                  'absolute right-0 p-2 bg-white border border-gray-200 rounded-md shadow-lg ' +
                  (isAppointmentTypeDetailsOpen &&
                  isAppointmentTypeDetailsOpen[i]
                    ? ''
                    : 'hidden')
                }
              >
                <Link
                  href={`/appointmentTypes/upsertOne?id=${appointmentType.id}`}
                >
                  <a className="block p-2">Éditer</a>
                </Link>
                <a
                  className="block p-2 text-red-500 hover:text-red-600"
                  onClick={() =>
                    setAppointmentTypeToDeleteId(appointmentType.id)
                  }
                >
                  Supprimer
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <WarningModal
        warningMessage="Vous êtes sur le point de supprimer un événement, confirmez-vous cette action ?"
        onCancel={() => setAppointmentTypeToDeleteId(-1)}
        onConfirm={() => {
          deleteOneAppointmentType({
            variables: { appointmentTypeId: appointmentTypeToDeleteId },
          })
          setAppointmentTypeToDeleteId(-1)
          setIsAppointmentTypeDetailsOpen(
            new Array(appointmentTypes.length).fill(false),
          )
        }}
        isShown={appointmentTypeToDeleteId >= 0}
      />
    </Layout>
  )
}

export default withApollo(AppointmentTypes)

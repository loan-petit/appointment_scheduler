import React from 'react'
import ReactDOMServer from 'react-dom/server'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import axios from 'axios'

import { withApollo } from '../../apollo/client'
import Layout from '../../components/adminSite/Layout'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import LoadingOverlay from '../../components/shared/LoadingOverlay'
import User, { UserFragments } from '../../models/User'
import Appointment, {
  AppointmentFragments,
  AppointmentOperations,
} from '../../models/Appointment'
import AppointmentCancellationForServiceProvider from '../../components/emails/cancellation/forServiceProvider'
import AppointmentCancellationForCustomer from '../../components/emails/cancellation/forCustomer'
import { AppointmentTypeFragments } from '../../models/AppointmentType'
import { CustomerFragments } from '../../models/Customer'

const UserQuery = gql`
  query UserQuery($username: String!) {
    user(where: { username: $username }) {
      ...UserFields
    }
  }
  ${UserFragments.fields}
`

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        ...UserPublicFields
      }
    }
  }
  ${UserFragments.publicFields}
`

const AppointmentQuery = gql`
  query AppointmentQuery($appointmentId: Int!) {
    appointment(where: { id: $appointmentId }) {
      ...AppointmentFields
      appointmentType {
        ...AppointmentTypeFields
      }
      customer {
        ...CustomerFields
      }
    }
  }
  ${AppointmentFragments.fields}
  ${AppointmentTypeFragments.fields}
  ${CustomerFragments.fields}
`

const DeleteOneAppointmentMutation = gql`
  mutation DeleteOneAppointmentMutation($appointmentId: Int!) {
    deleteOneAppointment(where: { id: $appointmentId }) {
      ...AppointmentFields
    }
  }
  ${AppointmentFragments.fields}
`

const CancelOneAppointment = () => {
  const router = useRouter()
  if (!router.query.id) {
    return (
      <p className="error-message">
        An `id` must be specified in query params.
      </p>
    )
  }

  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [user, setUser] = React.useState<User>()

  const userQueryResult = router.query.username
    ? useQuery(UserQuery)
    : useQuery(CurrentUserQuery)
  const appointmentQueryResult = useQuery(AppointmentQuery, {
    variables: { appointmentId: Number(router.query.id) },
  })
  const [deleteOneAppointment] = useMutation(DeleteOneAppointmentMutation, {
    update(cache, { data: { deleteOneAppointment } }) {
      try {
        const { userRes }: any = cache.readQuery({
          query: AppointmentOperations.appointments,
          variables: { userId: user?.id },
        })

        const removedAppointmentIndex = userRes.appointments.findIndex(
          (e: Appointment) => e.id == deleteOneAppointment.id,
        )
        if (removedAppointmentIndex > -1) {
          userRes.appointments.splice(removedAppointmentIndex, 1)
        }

        cache.writeQuery({
          query: AppointmentOperations.appointments,
          variables: { userId: user?.id },
          data: {
            __typename: 'User',
            user: {
              ...userRes,
              appointments: userRes.appointments,
            },
          },
        })
      } catch (e) {}
    },
  })

  const onSubmit = async (
    fieldsInformation: FieldsInformation,
    additionalVariables: any,
  ) => {
    if (!additionalVariables.appointment) {
      throw 'The appointment must be set in `additionalVariables`'
    }
    if (!additionalVariables.user) {
      throw 'The user must be set in `additionalVariables`'
    }
    if (typeof additionalVariables.fromCustomer === 'undefined') {
      throw 'The `fromCustomer` value must be set in `additionalVariables`'
    }
    if (!process.env.SEND_EMAIL_API_URL) {
      throw "Environment variable 'SEND_EMAIL_API_URL' must be specified"
    }

    const appointment: Appointment = additionalVariables.appointment
    const user: User = additionalVariables.user

    if (!appointment.customer || !appointment.appointmentType) {
      throw 'The `additionalVariables.appointment` value is incomplete and must contain the customer and appointmentType information'
    }

    await deleteOneAppointment({
      variables: { appointmentId: appointment.id },
    })

    const resources = [
      {
        name: 'tailwindcss',
        url: 'https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css',
        rel: 'stylesheet',
      },
    ]

    // Send email to the user
    await axios.post(process.env.SEND_EMAIL_API_URL, {
      toAddresses: [user.email],
      html: ReactDOMServer.renderToStaticMarkup(
        <AppointmentCancellationForServiceProvider
          user={user}
          appointment={appointment}
          message={
            additionalVariables.fromCustomer
              ? fieldsInformation.message.value
              : null
          }
        />,
      ),
      subject: `Votre rendez-vous avec ${appointment.customer.firstName} ${appointment.customer.lastName} a été annulé`,
      sender: 'petit.loan1@gmail.com',
      replyToAddresses: [appointment.customer.email],
      resources: resources,
    })

    // Send email to the customer
    await axios.post(process.env.SEND_EMAIL_API_URL, {
      toAddresses: [appointment.customer.email],
      html: ReactDOMServer.renderToStaticMarkup(
        <AppointmentCancellationForCustomer
          user={user}
          appointment={appointment}
          message={
            additionalVariables.fromCustomer
              ? null
              : fieldsInformation.message.value
          }
        />,
      ),
      subject: `Votre rendez-vous avec ${user.firstName} ${user.lastName} a été annulé`,
      sender: user.email,
      replyToAddresses: [user.email],
      resources: resources,
    })

    return true
  }

  const onSubmitResult = ({ error }: any) => {
    if (error) {
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: ['message'],
      refreshComponent: forceUpdate,
      fieldsValidator: () => '',
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  // Verify CurrentUserQuery result
  if (userQueryResult.loading) return <LoadingOverlay />
  else if (userQueryResult.error) {
    router.push('/auth/signin')
    return <div />
  }
  if (!user) {
    setUser(userQueryResult.data.me.user)
  }

  // Verify AppointmentTypeQuery result
  if (appointmentQueryResult.loading) return <LoadingOverlay />
  else if (appointmentQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  const appointment: Appointment = appointmentQueryResult.data.appointment

  return (
    <Layout>
      <div className="md:w-1/2">
        <header className="mb-6">
          <h5>Annuler un rendez-vous</h5>
        </header>

        {/* Message */}
        <div className="w-full mb-3">
          <label className="block mb-2">Message</label>
          <textarea
            rows={4}
            cols={80}
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Votre message"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="message"
            value={formHelper.fieldsInformation.message.value}
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.message.error}
          </p>
        </div>

        {/* Submit to change information */}
        <div className="mt-6">
          {(() => {
            if (formHelper.submitStatus.response) {
              return (
                <p className="pt-0 pb-4 text-sm italic text-green-500">
                  Le rendez-vous a bien été annulé.
                </p>
              )
            } else if (formHelper.submitStatus.userFriendlyError.length) {
              return (
                <p className="pt-0 pb-4 form-submit-error">
                  {formHelper.submitStatus.userFriendlyError}
                </p>
              )
            } else return null
          })()}
          <button
            className="px-6 py-3 submit-button"
            onClick={(e) => {
              formHelper.handleSubmit.bind(formHelper)(e, {
                appointment: appointment,
                user: user,
                fromCustomer: router.query.username ? true : false,
              })
            }}
          >
            Valider
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default withApollo(CancelOneAppointment)

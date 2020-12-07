import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import axios from 'axios'

import { withApollo } from '../../apollo/client'
import Layout from '../../components/adminSite/Layout'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import LoadingOverlay from '../../components/shared/LoadingOverlay'
import User, { UserOperations } from '../../models/User'
import Appointment from '../../models/appointment/Appointment'
import AppointmentCancellationForServiceProvider from '../../components/emails/cancellation/forServiceProvider'
import AppointmentCancellationForCustomer from '../../components/emails/cancellation/forCustomer'
import AppointmentOperations from '../../models/appointment/AppointmentOperations'

function removeAppointmentInList(appointments: Appointment[], id: number) {
  let removedAppointmentIndex = appointments.findIndex(
    (e: Appointment) => e.id == id,
  )
  if (removedAppointmentIndex > -1) {
    appointments.splice(removedAppointmentIndex, 1)
  }
  return appointments
}

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
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [user, setUser] = React.useState<User>()
  const [appointment, setAppointment] = React.useState<Appointment>()

  const userQueryResult = router.query.username
    ? useQuery(UserOperations.user, {
        variables: { username: router.query.username },
      })
    : useQuery(UserOperations.currentUserPublicFieldsOnly)
  const appointmentQueryResult = useQuery(AppointmentOperations.appointment, {
    variables: { appointmentId: Number(router.query.id) },
  })
  const [deleteOneAppointment] = useMutation(AppointmentOperations.deleteOne, {
    update(cache, { data: { deleteOneAppointment } }) {
      // Update cache for query in appointments list
      try {
        const userRes: any = cache.readQuery({
          query: AppointmentOperations.appointments,
          variables: { userId: user?.id },
        })

        userRes.user.appointments = removeAppointmentInList(
          userRes.user.appointments,
          deleteOneAppointment.id,
        )

        cache.writeQuery({
          query: AppointmentOperations.appointments,
          variables: { userId: user?.id },
          data: {
            __typename: 'User',
            user: {
              ...userRes.user,
              appointments: userRes.user.appointments,
            },
          },
        })
      } catch (e) {}

      // Update cache for query in customer appointments list
      try {
        if (appointment && appointment.customer) {
          const { customer }: any = cache.readQuery({
            query: AppointmentOperations.appointmentsForCustomer,
            variables: { customerId: appointment.customer.id },
          })

          customer.appointments = removeAppointmentInList(
            customer.appointments,
            deleteOneAppointment.id,
          )

          cache.writeQuery({
            query: AppointmentOperations.appointmentsForCustomer,
            variables: { customerId: appointment.customer.id },
            data: {
              __typename: 'Customer',
              customer: {
                ...customer,
                appointments: customer.appointments,
              },
            },
          })
        }
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
          isIssuedByUser={router.query.username === undefined}
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
          isIssuedByUser={router.query.username === undefined}
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

  // Verify UserQuery | CurrentUserQuery result
  if (userQueryResult.loading) return <LoadingOverlay />
  else if (userQueryResult.error) {
    router.push('/auth/signin')
    return <div />
  }
  if (!user) {
    setUser(
      router.query.username
        ? userQueryResult.data.user
        : userQueryResult.data.me.user,
    )
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
  if (!appointment) {
    setAppointment(appointmentQueryResult.data.appointment)
  }

  const body = (
    <>
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
              <>
                <p className="pt-0 pb-4 text-sm italic text-green-500">
                  Le rendez-vous a bien été annulé.
                </p>
                {!router.query.username && (
                  <button
                    className="px-6 py-3 submit-button"
                    onClick={() => router.back()}
                  >
                    Retour
                  </button>
                )}
              </>
            )
          } else if (formHelper.submitStatus.userFriendlyError.length) {
            return (
              <p className="pt-0 pb-4 form-submit-error">
                {formHelper.submitStatus.userFriendlyError}
              </p>
            )
          } else return null
        })()}

        {!formHelper.submitStatus.response && (
          <div className="flex justify-between">
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
            {!router.query.username && (
              <button
                className="text-sm font-bold text-right uppercase rounded focus:outline-none focus:ring"
                onClick={() => {
                  router.back()
                }}
              >
                Retourner sans annuler
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )

  return router.query.username ? (
    <div className="flex flex-col items-center p-6 m-4 bg-gray-200 rounded-lg shadow-lg md:mx-auto md:w-1/2">
      {body}
    </div>
  ) : (
    <Layout>
      <div className="md:w-1/2">{body}</div>
    </Layout>
  )
}

export default withApollo(CancelOneAppointment)

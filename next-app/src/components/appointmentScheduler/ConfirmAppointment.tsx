import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import axios from 'axios'

import User from '../../models/User'
import AppointmentType, {
  AppointmentTypeFragments,
} from '../../models/AppointmentType'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import Customer, { CustomerFragments } from '../../models/Customer'
import Appointment, { AppointmentFragments } from '../../models/Appointment'
import AppointmentConfirmationForServiceProvider from '../emails/appointmentConfirmation/forServiceProvider'
import AppointmentConfirmationForCustomer from '../emails/appointmentConfirmation/forCustomer'

const UpsertOneCustomerMutation = gql`
  mutation UpsertOneCustomerMutation(
    $email: String!
    $firstName: String!
    $lastName: String!
    $phone: String
    $address: String
    $isBlackListed: Boolean
  ) {
    upsertOneCustomer(
      create: {
        email: $email
        firstName: $firstName
        lastName: $lastName
        phone: $phone
        address: $address
        isBlackListed: $isBlackListed
      }
      update: {
        firstName: $firstName
        lastName: $lastName
        phone: $phone
        address: $address
        isBlackListed: $isBlackListed
      }
      where: { email: $email }
    ) {
      ...CustomerFields
    }
  }
  ${CustomerFragments.fields}
`

const CreateOneAppointmentMutation = gql`
  mutation CreateOneAppointmentMutation(
    $userId: Int!
    $customerId: Int!
    $appointmentTypeId: Int!
    $start: DateTime!
    $end: DateTime!
  ) {
    createOneAppointment(
      data: {
        start: $start
        end: $end
        appointmentType: { connect: { id: $appointmentTypeId } }
        user: { connect: { id: $userId } }
        customer: { connect: { id: $customerId } }
      }
    ) {
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

type Props = {
  user: User
  appointmentType: AppointmentType
  startDate: Date
  endDate: Date
}

const ConfirmAppointment: React.FunctionComponent<Props> = ({
  user,
  appointmentType,
  startDate,
  endDate,
}) => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [upsertOneCustomer] = useMutation(UpsertOneCustomerMutation)
  const [createOneAppointment] = useMutation(CreateOneAppointmentMutation)

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value.length ? 'Ce champ est obligatoire.' : ''
      case 'email':
        return !emailRegex.test(value) ? 'Veuillez entrer un email valide.' : ''
      default:
        return ''
    }
  }

  const onSubmit = async (fieldsInformation: FieldsInformation) => {
    if (!process.env.SEND_EMAIL_API_URL) {
      throw "Environment variable 'SEND_EMAIL_API_URL' must be specified"
    }

    const customer: Customer = (
      await upsertOneCustomer({
        variables: {
          firstName: fieldsInformation.firstName.value,
          lastName: fieldsInformation.lastName.value,
          email: fieldsInformation.email.value,
          phone: fieldsInformation.phone.value,
          address: fieldsInformation.address.value,
        },
      })
    ).data.upsertOneCustomer

    const appointment: Appointment = (
      await createOneAppointment({
        variables: {
          userId: user.id,
          customerId: customer.id,
          appointmentTypeId: appointmentType.id,
          start: startDate,
          end: endDate,
        },
      })
    ).data.createOneAppointment

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
        <AppointmentConfirmationForServiceProvider
          user={user}
          appointment={appointment}
          message={fieldsInformation.message.value}
        />,
      ),
      subject: `Un nouveau rendez-vous à été pris par ${customer.firstName} ${customer.lastName}`,
      sender: 'petit.loan1@gmail.com',
      replyToAddresses: [customer.email],
      resources: resources,
    })

    // Send email to the customer
    await axios.post(process.env.SEND_EMAIL_API_URL, {
      toAddresses: [customer.email],
      html: ReactDOMServer.renderToStaticMarkup(
        <AppointmentConfirmationForCustomer
          user={user}
          appointment={appointment}
        />,
      ),
      subject: `Vous avez pris rendez-vous avec ${user.firstName} ${user.lastName}`,
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
      fields: ['firstName', 'lastName', 'email', 'phone', 'address', 'message'],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <>
      <h4 className="pb-6">Veuillez remplir les informations suivantes</h4>

      {/* Full Name */}
      <div className="flex flex-row justify-between mb-3">
        <div className="w-full mr-2">
          <label className="block mb-2">Prénom</label>
          <input
            type="text"
            className="w-full p-3 placeholder-gray-400"
            placeholder="Votre prénom"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="firstName"
            value={formHelper.fieldsInformation.firstName.value}
            autoFocus
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.firstName.error}
          </p>
        </div>
        <div className="w-full ml-2">
          <label className="block mb-2">Nom</label>
          <input
            type="text"
            className="w-full p-3 placeholder-gray-400"
            placeholder="Votre nom"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="lastName"
            value={formHelper.fieldsInformation.lastName.value}
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.lastName.error}
          </p>
        </div>
      </div>

      {/* Email */}
      <div className="w-full mb-3">
        <label className="block mb-2">E-mail</label>
        <input
          type="email"
          className="w-full p-3 placeholder-gray-400"
          placeholder="Votre e-mail"
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name="email"
          value={formHelper.fieldsInformation.email.value}
        />
        <p className="form-field-error">
          {formHelper.fieldsInformation.email.error}
        </p>
      </div>

      {/* Phone */}
      <div className="w-full mb-3">
        <label className="block mb-2">Téléphone</label>
        <input
          type="tel"
          className="w-full p-3 placeholder-gray-400"
          placeholder="Votre numéro de téléphone"
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name="phone"
          value={formHelper.fieldsInformation.phone.value}
        />
        <p className="form-field-error">
          {formHelper.fieldsInformation.phone.error}
        </p>
      </div>

      {/* Address */}
      <div className="w-full mb-3">
        <label className="block mb-2">Adresse postale</label>
        <input
          type="text"
          className="w-full p-3 placeholder-gray-400"
          placeholder="Votre adresse"
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name="address"
          value={formHelper.fieldsInformation.address.value}
        />
        <p className="form-field-error">
          {formHelper.fieldsInformation.address.error}
        </p>
      </div>

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

      {/* Submit information */}
      <div className="mt-6">
        {(() => {
          if (formHelper.submitStatus.response) {
            return (
              <p className="text-sm italic text-green-500">
                Le rendez-vous a bien été pris en compte. Vous allez recevoir un
                email de confirmation.
              </p>
            )
          }

          return (
            <>
              {formHelper.submitStatus.userFriendlyError.length ? (
                <p className="pt-0 pb-4 form-submit-error">
                  {formHelper.submitStatus.userFriendlyError}
                </p>
              ) : null}
              <button
                className="px-6 py-3 submit-button"
                onClick={formHelper.handleSubmit.bind(formHelper)}
              >
                Confirmer le rendez-vous
              </button>
            </>
          )
        })()}
      </div>
    </>
  )
}

export default ConfirmAppointment

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import axios from 'axios'

import User from '../../models/User'
import Event from '../../models/Event'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import AppointmentConfirmation from './appointmentConfirmation'

type Props = {
  user: User
  event: Event
  dateTime: Date
}

const ContactInformation: React.FunctionComponent<Props> = ({
  user,
  event,
  dateTime,
}) => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

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

    // Send email to client
    await axios.post(process.env.SEND_EMAIL_API_URL, {
      toAddresses: [fieldsInformation.email.value],
      html: ReactDOMServer.renderToStaticMarkup(
        <AppointmentConfirmation
          event={event}
          dateTime={dateTime}
          message={`Vous venez de prendre rendez-vous avec ${user.firstName}`}
        />,
      ),
      subject: `Vous avez pris rendez-vous avec ${user.firstName} ${user.lastName}`,
      sender: user.email,
      replyToAddresses: [user.email],
    })

    // Send email to the service provider
    await axios.post(process.env.SEND_EMAIL_API_URL, {
      toAddresses: [user.email],
      html: ReactDOMServer.renderToStaticMarkup(
        <AppointmentConfirmation
          event={event}
          dateTime={dateTime}
          message={`${fieldsInformation.firstName.value} ${fieldsInformation.lastName.value} as pris rendez-vous avec vous.`}
        />,
      ),
      subject: `${fieldsInformation.firstName.value} ${fieldsInformation.lastName.value} as pris rendez-vous avec vous`,
      sender: 'petit.loan1@gmail.com',
      replyToAddresses: [fieldsInformation.email.value],
    })

    return true
  }

  const onSubmitResult = ({ error }: any) => {
    if (error) {
      console.log(error)
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: ['firstName', 'lastName', 'email'],
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

      {/* Submit information */}
      <div className="mt-6">
        {(() => {
          if (formHelper.submitStatus.response) {
            return (
              <p className="pt-0 pb-4 text-sm italic text-green-500">
                Le rendez-vous a bien été pris en compte. Vous allez recevoir un
                email de confirmation.
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
          onClick={formHelper.handleSubmit.bind(formHelper)}
        >
          Confirmer le rendez-vous
        </button>
      </div>
    </>
  )
}

export default ContactInformation

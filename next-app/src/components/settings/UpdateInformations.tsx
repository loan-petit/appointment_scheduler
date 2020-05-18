import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import User from '../../models/User'

const UpdateCurrentUserMutation = gql`
  mutation UpdateCurrentUserMutation(
    $email: String
    $firstName: String
    $lastName: String
  ) {
    updateCurrentUser(
      email: $email
      firstName: $firstName
      lastName: $lastName
    ) {
      id
    }
  }
`

type Props = {
  user: User
}

const UpdateInformations: React.FunctionComponent<Props> = ({ user }) => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [currentUser, setCurrentUser] = React.useState<User>()

  const [updateCurrentUser] = useMutation(UpdateCurrentUserMutation)

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

  const onSubmit = (fieldsInformation: FieldsInformation) =>
    updateCurrentUser({
      variables: {
        firstName: fieldsInformation.firstName.value,
        lastName: fieldsInformation.lastName.value,
        email: fieldsInformation.email.value,
      },
    })

  const onSubmitResult = ({ error }: any) => {
    if (error) {
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
  if (!currentUser) {
    formHelper.updateFieldValues(user)
    setCurrentUser(user)
  }

  return (
    <>
      <div className="mb-6">
        <h5>Vos informations</h5>
      </div>

      {/* Full Name */}
      <div className="flex flex-row justify-between mb-3">
        <div className="w-full mr-2">
          <label className="block mb-2">Prénom</label>
          <input
            type="text"
            className="w-full px-3 py-3 placeholder-gray-400"
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
            className="w-full px-3 py-3 placeholder-gray-400"
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
          className="w-full px-3 py-3 placeholder-gray-400"
          placeholder="Votre e-mail"
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name="email"
          value={formHelper.fieldsInformation.email.value}
        />
        <p className="form-field-error">
          {formHelper.fieldsInformation.email.error}
        </p>
      </div>

      {/* Submit to change information */}
      <div className="mt-6">
        {(() => {
          if (formHelper.submitStatus.response) {
            return (
              <p className="pt-0 pb-4 text-sm italic text-green-500">
                Les informations de votre compte ont bien été mises à jour.
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
          Sauvegarder
        </button>
      </div>
    </>
  )
}

export default UpdateInformations

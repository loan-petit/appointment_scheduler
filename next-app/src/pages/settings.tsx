import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/LoadingOverlay'
import FormHelper, { FieldsInformation } from '../utils/FormHelper'
import User from '../models/User'
import Layout from '../components/Layout'

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

const UpdateCurrentUserMutation = gql`
  mutation UpdateCurrentUserMutation(
    $email: String
    $firstName: String
    $lastName: String
    $oldPassword: String
    $newPassword: String
    $newPasswordConfirmation: String
  ) {
    updateCurrentUser(
      email: $email
      firstName: $firstName
      lastName: $lastName
      oldPassword: $oldPassword
      newPassword: $newPassword
      newPasswordConfirmation: $newPasswordConfirmation
    ) {
      id
      email
      firstName
      lastName
    }
  }
`

const Settings = () => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [updateCurrentUser] = useMutation(UpdateCurrentUserMutation)

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const informationFieldsValidator = (name: String, value: any) => {
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

  const passwordFieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'oldPassword':
      case 'newPassword':
      case 'newPasswordConfirmation':
        return value.length < 8
          ? 'Votre mot de passe doit contenir au minimum 8 caractères.'
          : ''
      default:
        return ''
    }
  }

  const onSubmitInformationForm = (fieldsInformation: FieldsInformation) =>
    updateCurrentUser({
      variables: {
        firstName: fieldsInformation.firstName.value,
        lastName: fieldsInformation.lastName.value,
        email: fieldsInformation.email.value,
      },
    })

  const onSubmitPasswordForm = (fieldsInformation: FieldsInformation) =>
    updateCurrentUser({
      variables: {
        oldPassword: fieldsInformation.oldPassword.value,
        newPassword: fieldsInformation.newPassword.value,
        newPasswordConfirmation:
          fieldsInformation.newPasswordConfirmation.value,
      },
    })

  const onSubmitInformationFormResult = ({ error }: any) => {
    if (error) {
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const onSubmitPasswordFormResult = ({ error }: any) => {
    if (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (message === "'password' must match 'passwordConfirmation'") {
          return "Aucun compte n'est associé à cette adresse e-mail."
        } else if (message === 'Invalid password') {
          return 'Le mot de passe est invalide.'
        }
      }
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const [informationFormHelper] = React.useState(
    new FormHelper({
      fields: ['firstName', 'lastName', 'email'],
      refreshComponent: forceUpdate,
      fieldsValidator: informationFieldsValidator,
      onSubmit: onSubmitInformationForm,
      onSubmitResult: onSubmitInformationFormResult,
    }),
  )
  const [passwordFormHelper] = React.useState(
    new FormHelper({
      fields: ['oldPassword', 'newPassword', 'newPasswordConfirmation'],
      refreshComponent: forceUpdate,
      fieldsValidator: passwordFieldsValidator,
      onSubmit: onSubmitPasswordForm,
      onSubmitResult: onSubmitPasswordFormResult,
    }),
  )

  const [currentUser, setCurrentUser] = React.useState<User>()
  const { loading, error, data } = useQuery(CurrentUserQuery)
  if (loading) return <LoadingOverlay />
  if (error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    informationFormHelper.updateFieldValues(data.me.user)
    setCurrentUser(data.me.user)
  }

  return (
    <Layout>
      <div className="md:w-1/2">
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
              onChange={informationFormHelper.handleInputChange.bind(
                informationFormHelper,
              )}
              name="firstName"
              value={informationFormHelper.fieldsInformation.firstName.value}
              autoFocus
            />
            <p className="form-field-error">
              {informationFormHelper.fieldsInformation.firstName.error}
            </p>
          </div>
          <div className="w-full ml-2">
            <label className="block mb-2">Nom</label>
            <input
              type="text"
              className="w-full px-3 py-3 placeholder-gray-400"
              placeholder="Votre nom"
              onChange={informationFormHelper.handleInputChange.bind(
                informationFormHelper,
              )}
              name="lastName"
              value={informationFormHelper.fieldsInformation.lastName.value}
            />
            <p className="form-field-error">
              {informationFormHelper.fieldsInformation.lastName.error}
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
            onChange={informationFormHelper.handleInputChange.bind(
              informationFormHelper,
            )}
            name="email"
            value={informationFormHelper.fieldsInformation.email.value}
          />
          <p className="form-field-error">
            {informationFormHelper.fieldsInformation.email.error}
          </p>
        </div>

        {/* Submit to change information */}
        <div className="mt-6">
          {(() => {
            if (informationFormHelper.submitStatus.response) {
              return (
                <p className="pt-0 pb-4 text-sm italic text-green-500">
                  Les informations de votre compte ont bien été mises à jour.
                </p>
              )
            } else if (
              informationFormHelper.submitStatus.userFriendlyError.length
            ) {
              return (
                <p className="pt-0 pb-4 form-submit-error">
                  {informationFormHelper.submitStatus.userFriendlyError}
                </p>
              )
            } else return null
          })()}
          <button
            className="px-6 py-3 submit-button"
            onClick={informationFormHelper.handleSubmit.bind(
              informationFormHelper,
            )}
          >
            Sauvegarder
          </button>
        </div>

        <hr className="my-12 border-gr border-b-1" />
        <div className="mb-6">
          <h5>Changer votre mot de passe</h5>
        </div>

        {/* Current password */}
        <div className="w-full mb-3">
          <label className="block mb-2">Mot de passe actuel</label>
          <input
            type="password"
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Votre mot de passe"
            name="oldPassword"
            onChange={passwordFormHelper.handleInputChange.bind(
              passwordFormHelper,
            )}
            value={passwordFormHelper.fieldsInformation.oldPassword.value}
          />
          <p className="form-field-error">
            {passwordFormHelper.fieldsInformation.oldPassword.error}
          </p>
        </div>

        {/* New password */}
        <div className="w-full mb-3">
          <label className="block mb-2">Nouveau mot de passe</label>
          <input
            type="password"
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Votre nouveau mot de passe"
            name="newPassword"
            onChange={passwordFormHelper.handleInputChange.bind(
              passwordFormHelper,
            )}
            value={passwordFormHelper.fieldsInformation.newPassword.value}
          />
          <p className="form-field-error">
            {passwordFormHelper.fieldsInformation.newPassword.error}
          </p>
        </div>

        {/* New password confirmation */}
        <div className="w-full mb-3">
          <label className="block mb-2">
            Confirmez votre nouveau mot de passe
          </label>
          <input
            type="password"
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Confirmez votre nouveau mot de passe"
            name="newPasswordConfirmation"
            onChange={passwordFormHelper.handleInputChange.bind(
              passwordFormHelper,
            )}
            value={
              passwordFormHelper.fieldsInformation.newPasswordConfirmation.value
            }
          />
          <p className="form-field-error">
            {passwordFormHelper.fieldsInformation.newPasswordConfirmation.error}
          </p>
        </div>

        {/* Submit to change password */}
        <div className="mt-6">
          {(() => {
            if (passwordFormHelper.submitStatus.response) {
              return (
                <p className="pt-0 pb-4 text-sm italic text-green-500">
                  Les informations de votre compte ont bien été mises à jour.
                </p>
              )
            } else if (
              passwordFormHelper.submitStatus.userFriendlyError.length
            ) {
              return (
                <p className="pt-0 pb-4 form-submit-error">
                  {passwordFormHelper.submitStatus.userFriendlyError}
                </p>
              )
            } else return null
          })()}
          <button
            className="px-6 py-3 submit-button"
            onClick={passwordFormHelper.handleSubmit.bind(passwordFormHelper)}
          >
            Valider
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default withApollo(Settings)

import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

import FormHelper, { FieldsInformation } from '../../../utils/FormHelper'

const UpdateCurrentUserMutation = gql`
  mutation UpdateCurrentUserMutation(
    $oldPassword: String!
    $newPassword: String!
    $newPasswordConfirmation: String!
  ) {
    updateCurrentUser(
      oldPassword: $oldPassword
      newPassword: $newPassword
      newPasswordConfirmation: $newPasswordConfirmation
    ) {
      id
    }
  }
`

const UpdatePassword = () => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [updateCurrentUser] = useMutation(UpdateCurrentUserMutation)

  const fieldsValidator = (name: String, value: any) => {
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

  const onSubmit = (fieldsInformation: FieldsInformation) =>
    updateCurrentUser({
      variables: {
        oldPassword: fieldsInformation.oldPassword.value,
        newPassword: fieldsInformation.newPassword.value,
        newPasswordConfirmation:
          fieldsInformation.newPasswordConfirmation.value,
      },
    })

  const onSubmitResult = ({ error }: any) => {
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

  const [formHelper] = React.useState(
    new FormHelper({
      fields: ['oldPassword', 'newPassword', 'newPasswordConfirmation'],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <>
      {/* Current password */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>Mot de passe actuel</label>
        <input
          type='password'
          className='w-full p-3 placeholder-gray-400'
          placeholder='Votre mot de passe'
          name='oldPassword'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          value={formHelper.fieldsInformation.oldPassword.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.oldPassword.error}
        </p>
      </div>

      {/* New password */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>Nouveau mot de passe</label>
        <input
          type='password'
          className='w-full p-3 placeholder-gray-400'
          placeholder='Votre nouveau mot de passe'
          name='newPassword'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          value={formHelper.fieldsInformation.newPassword.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.newPassword.error}
        </p>
      </div>

      {/* New password confirmation */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>
          Confirmez votre nouveau mot de passe
        </label>
        <input
          type='password'
          className='w-full p-3 placeholder-gray-400'
          placeholder='Confirmez votre nouveau mot de passe'
          name='newPasswordConfirmation'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          value={formHelper.fieldsInformation.newPasswordConfirmation.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.newPasswordConfirmation.error}
        </p>
      </div>

      {/* Submit to change password */}
      <div className='mt-6'>
        {(() => {
          if (formHelper.submitStatus.response) {
            return (
              <p className='pt-0 pb-4 text-sm italic text-green-500'>
                Les informations de votre compte ont bien été mises à jour.
              </p>
            )
          } else if (formHelper.submitStatus.userFriendlyError.length) {
            return (
              <p className='pt-0 pb-4 form-submit-error'>
                {formHelper.submitStatus.userFriendlyError}
              </p>
            )
          } else return null
        })()}
        <button
          className='px-6 py-3 submit-button'
          onClick={formHelper.handleSubmit.bind(formHelper)}
        >
          Valider
        </button>
      </div>
    </>
  )
}

export default UpdatePassword

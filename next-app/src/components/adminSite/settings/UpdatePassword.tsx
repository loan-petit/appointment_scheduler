import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

import FormHelper, { FieldsInformation } from '../../../utils/FormHelper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const UpdateCurrentUserPasswordMutation = gql`
  mutation UpdateCurrentUserPasswordMutation(
    $oldPassword: String!
    $newPassword: String!
  ) {
    updateCurrentUser(oldPassword: $oldPassword, newPassword: $newPassword) {
      id
    }
  }
`

const UpdatePassword = () => {
  // Hook to force component rerender
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [updateCurrentUser] = useMutation(UpdateCurrentUserPasswordMutation)

  const [isOldPasswordVisible, setIsOldPasswordVisible] = React.useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = React.useState(false)

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'oldPassword':
      case 'newPassword':
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
      },
    })

  const onSubmitResult = ({ error }: any) => {
    if (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (message === 'Invalid password') {
          return 'Le mot de passe est invalide.'
        }
      }
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: ['oldPassword', 'newPassword'],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <>
      {/* Current password */}
      <div className='relative w-full mb-3'>
        <label className='block mb-2'>Mot de passe actuel</label>
        <div className='flex password-input-container'>
          <input
            type={isOldPasswordVisible ? 'text' : 'password'}
            className='w-full px-3 py-3 placeholder-gray-400 shadow-none focus:shadow-none'
            placeholder='Votre mot de passe'
            name='oldPassword'
            onChange={formHelper.handleInputChange.bind(formHelper)}
            value={formHelper.fieldsInformation.oldPassword.value}
          />
          <button
            className='px-2 focus:outline-none'
            onClick={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
            tabIndex={-1}
          >
            {isOldPasswordVisible ? (
              <FontAwesomeIcon icon={faEyeSlash} size='lg' />
            ) : (
              <FontAwesomeIcon icon={faEye} size='lg' />
            )}
          </button>
        </div>
        <p className='form-field-error'>
          {formHelper.fieldsInformation.oldPassword.error}
        </p>
      </div>

      {/* New password */}
      <div className='relative w-full mb-3'>
        <label className='block mb-2'>Nouveau mot de passe</label>
        <div className='flex password-input-container'>
          <input
            type={isNewPasswordVisible ? 'text' : 'password'}
            className='w-full px-3 py-3 placeholder-gray-400 shadow-none focus:shadow-none'
            placeholder='Votre nouveau mot de passe'
            name='newPassword'
            onChange={formHelper.handleInputChange.bind(formHelper)}
            value={formHelper.fieldsInformation.newPassword.value}
          />
          <button
            className='px-2 focus:outline-none'
            onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
            tabIndex={-1}
          >
            {isNewPasswordVisible ? (
              <FontAwesomeIcon icon={faEyeSlash} size='lg' />
            ) : (
              <FontAwesomeIcon icon={faEye} size='lg' />
            )}
          </button>
        </div>
        <p className='form-field-error'>
          {formHelper.fieldsInformation.newPassword.error}
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

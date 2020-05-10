import React from 'react'
import Router from 'next/router'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'

import { withApollo } from '../apollo/client'
import LoadingOverlay from '../components/LoadingOverlay'
import User from '../interfaces/User'

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
  const [formFields, setFormFields] = React.useState({
    firstName: { value: '', error: '' },
    lastName: { value: '', error: '' },
    email: { value: '', error: '' },
    oldPassword: { value: '', error: '' },
    newPassword: { value: '', error: '' },
    newPasswordConfirmation: { value: '', error: '' },
  })
  const [informationSubmitError, setInformationSubmitError] = React.useState('')
  const [passwordSubmitError, setPasswordSubmitError] = React.useState('')

  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [updateCurrentUser] = useMutation(UpdateCurrentUserMutation)

  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const { loading, error, data } = useQuery(CurrentUserQuery)
  if (loading) return <LoadingOverlay />
  if (error) {
    console.log(error)
    Router.push('/auth/signin')
    return <div />
  }

  if (!currentUser) {
    let tmpCurrentUser = data.me.user
    formFields.firstName.value = tmpCurrentUser.firstName
    formFields.lastName.value = tmpCurrentUser.lastName
    formFields.email.value = tmpCurrentUser.email
    setFormFields(formFields)
    setCurrentUser(data.me.user)
  }

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const validateField = (name: String, { value }: any) => {
    let error = ''

    switch (name) {
      case 'firstName':
      case 'lastName':
        error = !value.length ? 'Ce champ est obligatoire.' : ''
        break
      case 'email':
        error = !emailRegex.test(value)
          ? 'Veuillez entrer un email valide.'
          : ''
        break
      case 'newPassword':
      case 'newPasswordConfirmation':
        error =
          value.length && value.length < 8
            ? 'Votre mot de passe doit contenir au minimum 8 caractères.'
            : ''
        break
    }

    return error
  }

  const validateForm = () => {
    let updatedFields: any = formFields
    let isValid = true

    Object.entries(formFields).forEach(([key, value]) => {
      let error = validateField(key, value)
      updatedFields[key].error = error
      if (error.length) isValid = false
    })

    if (!isValid) {
      setFormFields(updatedFields)
      forceUpdate()
    }
    return isValid
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    const error = validateField(name, { value: value })

    setFormFields({
      ...formFields,
      [name]: { error: error, value: value },
    })
  }

  const handleSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>,
    updateInformation: boolean,
  ) => {
    event.preventDefault()

    if (validateForm()) {
      try {
        let variables
        if (updateInformation) {
          variables = {
            firstName: formFields.firstName.value,
            lastName: formFields.lastName.value,
            email: formFields.email.value,
          }
        } else {
          variables = {
            oldPassword: formFields.oldPassword.value,
            newPassword: formFields.newPassword.value,
            newPasswordConfirmation: formFields.newPasswordConfirmation.value,
          }
        }

        await updateCurrentUser({
          variables: variables,
        })
        if (updateInformation) {
          setInformationSubmitError('noerror')
        } else {
          setPasswordSubmitError('noerror')
        }
      } catch (err) {
        if (err.graphQLErrors && err.graphQLErrors.length) {
          let message = err.graphQLErrors[0].message
          if (!updateInformation) {
            if (message == "'password' must match 'passwordConfirmation'") {
              return setPasswordSubmitError(
                'Le mot de passe et le mot de passe de confirmation sont différents.',
              )
            } else if (message == 'Invalid password') {
              return setPasswordSubmitError('Le mot de passe est invalide.')
            }
          }
        }
        if (updateInformation) {
          setInformationSubmitError(
            'Une erreur est survenue. Veuillez-réessayer.',
          )
        } else {
          setPasswordSubmitError('Une erreur est survenue. Veuillez-réessayer.')
        }
      }
    }
  }

  return (
    <section className='absolute flex flex-col justify-center w-full h-full p-4 bg-gray-100'>
      <div className='container flex flex-col w-full min-w-0 p-4 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12'>
        <div className='flex-auto px-4 py-10 pt-0 lg:px-10'>
          <div className='mb-6 text-center'>
            <h6>Vos informations</h6>
          </div>

          {/* Full Name */}
          <div className='relative flex flex-row justify-between mb-3'>
            <div className='w-full mr-2'>
              <label className='block mb-2'>Prénom</label>
              <input
                type='text'
                className='w-full px-3 py-3 placeholder-gray-400'
                placeholder='Prénom'
                onChange={handleInputChange}
                name='firstName'
                value={formFields.firstName.value}
                autoFocus
              />
              <p className='form-error'>{formFields.firstName.error}</p>
            </div>
            <div className='w-full ml-2'>
              <label className='block mb-2'>Nom</label>
              <input
                type='text'
                className='w-full px-3 py-3 placeholder-gray-400'
                placeholder='Nom'
                onChange={handleInputChange}
                name='lastName'
                value={formFields.lastName.value}
              />
              <p className='form-error'>{formFields.lastName.error}</p>
            </div>
          </div>

          {/* Email */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>E-mail</label>
            <input
              type='email'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='E-mail'
              onChange={handleInputChange}
              name='email'
              value={formFields.email.value}
            />
            <p className='form-error'>{formFields.email.error}</p>
          </div>

          {/* Submit to change information */}
          <div className='mt-6 text-center'>
            {(() => {
              if (informationSubmitError.length) {
                if (informationSubmitError !== 'noerror') {
                  return (
                    <p className='pt-0 pb-4 error-message'>
                      {informationSubmitError}
                    </p>
                  )
                } else {
                  return (
                    <p className='pt-0 pb-4 text-sm italic text-green-500'>
                      {
                        'Les informations de votre compte ont bien été mises à jour.'
                      }
                    </p>
                  )
                }
              } else return null
            })()}
            <button
              className='px-6 py-3 submit-button'
              onClick={e => handleSubmit(e, true)}
            >
              Sauvegarder
            </button>
          </div>

          <hr className='my-10 border-gray-500 border-b-1' />
          <div className='mb-6 text-center'>
            <h6>Changer votre mot de passe</h6>
          </div>

          {/* Current password */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>Mot de passe actuel</label>
            <input
              type='password'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='Votre mot de passe'
              name='newPassword'
              onChange={handleInputChange}
              value={formFields.newPassword.value}
            />
            <p className='form-error'>{formFields.newPassword.error}</p>
          </div>

          {/* New password */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>Nouveau mot de passe</label>
            <input
              type='password'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='Votre nouveau mot de passe'
              name='newPassword'
              onChange={handleInputChange}
              value={formFields.newPassword.value}
            />
            <p className='form-error'>{formFields.newPassword.error}</p>
          </div>

          {/* New password confirmation */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>
              Confirmez votre nouveau mot de passe
            </label>
            <input
              type='password'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='Confirmez votre nouveau mot de passe'
              name='newPasswordConfirmation'
              onChange={handleInputChange}
              value={formFields.newPasswordConfirmation.value}
            />
            <p className='form-error'>
              {formFields.newPasswordConfirmation.error}
            </p>
          </div>

          {/* Submit to change password */}
          <div className='mt-6 text-center'>
            {(() => {
              if (passwordSubmitError.length) {
                if (passwordSubmitError !== 'noerror') {
                  return (
                    <p className='pt-0 pb-4 error-message'>
                      {passwordSubmitError}
                    </p>
                  )
                } else {
                  return (
                    <p className='pt-0 pb-4 text-sm italic text-green-500'>
                      {
                        'Les informations de votre compte ont bien été mises à jour.'
                      }
                    </p>
                  )
                }
              } else return null
            })()}
            <button
              className='px-6 py-3 submit-button'
              onClick={e => handleSubmit(e, false)}
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default withApollo(Settings)

import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import Cookies from 'js-cookie'

import { withApollo } from '../../apollo/client'

const SignupMutation = gql`
  mutation SignupMutation(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      token
      expiresIn
      user {
        id
      }
    }
  }
`

const Signup = () => {
  const [formFields, setFormFields] = React.useState({
    firstName: { value: '', error: '' },
    lastName: { value: '', error: '' },
    email: { value: '', error: '' },
    password: { value: '', error: '' },
    passwordConfirmation: { value: '', error: '' },
  })
  const [submitError, setSubmitError] = React.useState('')

  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [signup] = useMutation(SignupMutation)

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
      case 'password':
      case 'passwordConfirmation':
        error =
          value.length < 8
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

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (validateForm()) {
      try {
        const { data } = await signup({
          variables: {
            firstName: formFields.firstName.value,
            lastName: formFields.lastName.value,
            email: formFields.email.value,
            password: formFields.password.value,
            passwordConfirmation: formFields.passwordConfirmation.value,
          },
        })
        Cookies.set('token', data.signin.token, {
          expires: Math.floor(data.signin.expiresIn / (3600 * 24)),
        })
        Router.push('/')
      } catch (err) {
        if (err.graphQLErrors && err.graphQLErrors.length) {
          let message = err.graphQLErrors[0].message
          if (message == "'password' must match 'passwordConfirmation'") {
            return setSubmitError(
              'Le mot de passe et le mot de passe de confirmation sont différents.',
            )
          }
        }
        setSubmitError('Une erreur est survenue. Veuillez-réessayer.')
      }
    }
  }

  return (
    <section className='absolute flex flex-col justify-center w-full h-full p-4 bg-gray-100'>
      <div className='container flex flex-col w-full min-w-0 p-4 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12'>
        {/* Signup with Google */}
        <div className='px-6 py-6 mb-0 rounded-t'>
          <div className='mb-3 text-center'>
            <h6>S'inscrire avec</h6>
          </div>
          <div className='text-center btn-wrapper'>
            <button
              className='inline-flex items-center px-4 py-2 mb-1 mr-1 text-xs font-normal font-bold text-gray-800 uppercase bg-white rounded shadow outline-none active:bg-gray-100 focus:outline-none hover:shadow-md'
              type='button'
            >
              <img alt='...' className='w-5 mr-1' src='/svg/googleLogo.svg' />
              Google
            </button>
          </div>
          <hr className='mt-6 border-gray-500 border-b-1' />
        </div>

        {/* Signup with credentials */}
        <div className='flex-auto px-4 py-10 pt-0 lg:px-10'>
          <div className='mb-3 text-center'>
            <h6>Ou avec des identifiants</h6>
          </div>

          {/* Full Name */}
          <div className='relative flex flex-row justify-between mb-3'>
            <div className='w-full mr-2'>
              <label className='block mb-2'>Prénom</label>
              <input
                type='text'
                className='w-full px-3 py-3 placeholder-gray-400'
                placeholder='Votre prénom'
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
                placeholder='Votre nom'
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
              placeholder='Votre e-mail'
              onChange={handleInputChange}
              name='email'
              value={formFields.email.value}
            />
            <p className='form-error'>{formFields.email.error}</p>
          </div>

          {/* Password */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>Mot de passe</label>
            <input
              type='password'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='Votre mot de passe'
              name='password'
              onChange={handleInputChange}
              value={formFields.password.value}
            />
            <p className='form-error'>{formFields.password.error}</p>
          </div>

          {/* Password confirmation */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>Confirmer votre mot de passe</label>
            <input
              type='password'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='Confirmez votre mot de passe'
              name='passwordConfirmation'
              onChange={handleInputChange}
              value={formFields.passwordConfirmation.value}
            />
            <p className='form-error'>
              {formFields.passwordConfirmation.error}
            </p>
          </div>

          {/* Submit */}
          <div className='mt-6 text-center'>
            {submitError.length ? (
              <p className='pt-0 pb-4 error-message'>{submitError}</p>
            ) : null}
            <button className='px-6 py-3 submit-button' onClick={handleSubmit}>
              Créer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Signin */}
      <div className='mt-6 text-lg font-semibold text-center text-gray-800'>
        <Link href='/auth/signin'>
          <small>Vous avez déjà un compte ? Connectez-vous.</small>
        </Link>
      </div>
    </section>
  )
}

export default withApollo(Signup)

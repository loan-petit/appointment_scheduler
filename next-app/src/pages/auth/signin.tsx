import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

import { withApollo } from '../../apollo/client'

const SigninMutation = gql`
  mutation SigninMutation($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      token
      expiresIn
      user {
        id
      }
    }
  }
`

const Signin = () => {
  const [formFields, setFormFields] = React.useState({
    email: { value: '', error: '' },
    password: { value: '', error: '' },
  })
  const [submitError, setSubmitError] = React.useState('')

  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [signin] = useMutation(SigninMutation)

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const validateField = (name: String, { value }: any) => {
    let error = ''

    switch (name) {
      case 'email':
        error = !emailRegex.test(value)
          ? 'Veuillez entrer un email valide.'
          : ''
        break
      case 'password':
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
        await signin({
          variables: {
            email: formFields.email.value,
            password: formFields.password.value,
          },
        })
        Router.push('/')
      } catch (err) {
        if (err.graphQLErrors && err.graphQLErrors.length) {
          let message = err.graphQLErrors[0].message
          if (message.includes('No user found for email')) {
            setSubmitError("Aucun compte n'est associé à cette adresse e-mail.")
          } else if (message == 'Invalid password') {
            setSubmitError('Le mot de passe est invalide.')
          }
        }
        if (err.networkError) {
          setSubmitError('Une erreur est survenue. Veuillez-réessayer.')
        }
      }
    }
  }

  return (
    <section className='absolute flex flex-col justify-center w-full h-full p-4 bg-gray-100'>
      <div className='container flex flex-col w-full min-w-0 p-4 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12'>
        {/* Connection with Google */}
        <div className='px-6 py-6 mb-0 rounded-t'>
          <div className='mb-3 text-center'>
            <h6>Se connecter avec</h6>
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
          <hr className='mt-6 border-gray-400 border-b-1' />
        </div>

        {/* Connection with credentials */}
        <div className='flex-auto px-4 py-10 pt-0 lg:px-10'>
          <div className='mb-3 font-bold text-center text-gray-500'>
            <small>Ou avec des identifiants</small>
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
              autoFocus
            />
            <p className='form-error'>{formFields.email.error}</p>
          </div>

          {/* Password */}
          <div className='relative w-full mb-3'>
            <label className='block mb-2'>Mot de passe</label>
            <input
              type='password'
              className='w-full px-3 py-3 placeholder-gray-400'
              placeholder='Mot de passe'
              name='password'
              onChange={handleInputChange}
              value={formFields.password.value}
            />
            <p className='form-error'>{formFields.password.error}</p>
          </div>

          {/* Submit */}
          <div className='mt-6 text-center'>
            {submitError.length ? (
              <p className='pt-0 pb-4 error-message'>{submitError}</p>
            ) : null}
            <button className='px-6 py-3' type='button' onClick={handleSubmit}>
              Se connecter
            </button>
          </div>
        </div>
      </div>

      {/* Signup */}
      <div className='mt-6 text-lg font-semibold text-center text-gray-800'>
        <Link href='/auth/signup'>
          <small>Pas de compte ? Créez-en un.</small>
        </Link>
      </div>
    </section>
  )
}

export default withApollo(Signin)

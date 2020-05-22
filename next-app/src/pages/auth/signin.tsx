import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import Cookies from 'js-cookie'

import { withApollo } from '../../apollo/client'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import AuthPayload from '../../models/AuthPayload'

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
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const [signin] = useMutation(SigninMutation)

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'email':
        return !emailRegex.test(value) ? 'Veuillez entrer un email valide.' : ''
      case 'password':
        return value.length < 8
          ? 'Votre mot de passe doit contenir au minimum 8 caractères.'
          : ''
      default:
        return ''
    }
  }

  const onSubmit = (fieldsInformation: FieldsInformation) =>
    signin({
      variables: {
        email: fieldsInformation.email.value,
        password: fieldsInformation.password.value,
      },
    })

  const onSubmitResult = ({ response, error }: any) => {
    if (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (message.includes('No user found for email')) {
          return "Aucun compte n'est associé à cette adresse e-mail."
        } else if (message == 'Invalid password') {
          return 'Le mot de passe est invalide.'
        }
      }
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }

    const authPayload: AuthPayload = response.data.signin
    Cookies.set('token', authPayload.token, {
      expires: Math.floor(authPayload.expiresIn / (3600 * 24)),
    })
    Router.push('/')
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: ['email', 'password'],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <section className="absolute flex flex-col justify-center w-full h-full p-4 bg-gray-100">
      <div className="container flex flex-col w-full min-w-0 p-4 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12">
        {/* Signin with Google */}
        <div className="px-6 py-6 mb-0 rounded-t">
          <div className="mb-3 text-center">
            <h6>Se connecter avec</h6>
          </div>
          <div className="text-center btn-wrapper">
            <button
              className="inline-flex items-center px-4 py-2 mb-1 mr-1 text-xs font-normal font-bold text-gray-800 uppercase bg-white rounded shadow outline-none active:bg-gray-100 focus:outline-none hover:shadow-md"
              type="button"
            >
              <img alt="..." className="w-5 mr-1" src="/svg/googleLogo.svg" />
              Google
            </button>
          </div>
          <hr className="mt-6 border-gray-500 border-b-1" />
        </div>

        {/* Signin with credentials */}
        <div className="flex-auto px-4 py-10 pt-0 lg:px-10">
          <div className="mb-3 text-center">
            <h6>Ou avec des identifiants</h6>
          </div>

          {/* Email */}
          <div className="relative w-full mb-3">
            <label className="block mb-2">E-mail</label>
            <input
              type="email"
              className="w-full px-3 py-3 placeholder-gray-400"
              placeholder="Votre e-mail"
              onChange={formHelper.handleInputChange.bind(formHelper)}
              name="email"
              value={formHelper.fieldsInformation.email.value}
              autoFocus
            />
            <p className="form-field-error">
              {formHelper.fieldsInformation.email.error}
            </p>
          </div>

          {/* Password */}
          <div className="relative w-full mb-3">
            <label className="block mb-2">Mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-3 placeholder-gray-400"
              placeholder="Votre mot de passe"
              name="password"
              onChange={formHelper.handleInputChange.bind(formHelper)}
              value={formHelper.fieldsInformation.password.value}
            />
            <p className="form-field-error">
              {formHelper.fieldsInformation.password.error}
            </p>
          </div>

          {/* Submit */}
          <div className="mt-6 text-center">
            {formHelper.submitStatus.userFriendlyError.length ? (
              <p className="pt-0 pb-4 form-submit-error">
                {formHelper.submitStatus.userFriendlyError}
              </p>
            ) : null}
            <button
              className="px-6 py-3 submit-button"
              onClick={formHelper.handleSubmit.bind(formHelper)}
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      {/* Signup */}
      <div className="mt-6 text-lg font-semibold text-center text-gray-800">
        <Link href="/auth/signup">
          <small className="cursor-pointer">Pas de compte ? Créez-en un.</small>
        </Link>
      </div>
    </section>
  )
}

export default withApollo(Signin)

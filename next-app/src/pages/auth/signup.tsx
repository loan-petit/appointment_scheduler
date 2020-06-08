import React from 'react'
import Link from 'next/link'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { GoogleLogin, GoogleLoginResponse } from 'react-google-login'

import { withApollo } from '../../apollo/client'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import FillMissingAccountInformation from '../../components/adminSite/FillMissingAccountInformation'
import storeJWT from '../../utils/storeJWT'

const CredentialsSignupMutation = gql`
  mutation CredentialsSignupMutation(
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
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [signup] = useMutation(CredentialsSignupMutation)

  const [googleUser, setGoogleUser] = React.useState<GoogleLoginResponse>()
  const [googleAuthError, setGoogleAuthError] = React.useState('')

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
      case 'password':
      case 'passwordConfirmation':
        return value.length < 8
          ? 'Votre mot de passe doit contenir au minimum 8 caractères.'
          : ''
      default:
        return ''
    }
  }

  const onSubmit = (fieldsInformation: FieldsInformation) =>
    signup({
      variables: {
        firstName: fieldsInformation.firstName.value,
        lastName: fieldsInformation.lastName.value,
        email: fieldsInformation.email.value,
        password: fieldsInformation.password.value,
        passwordConfirmation: fieldsInformation.passwordConfirmation.value,
      },
    })

  const onSubmitResult = ({ response, error }: any) => {
    if (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (message == "'password' must match 'passwordConfirmation'") {
          return 'Le mot de passe et le mot de passe de confirmation sont différents.'
        }
      }
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }

    storeJWT(response.data.signup)
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: [
        'firstName',
        'lastName',
        'email',
        'password',
        'passwordConfirmation',
      ],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <div className="absolute flex flex-col justify-center w-full h-full p-4 bg-gray-100">
      {googleUser ? (
        <FillMissingAccountInformation googleUser={googleUser} />
      ) : (
        <div className="container flex flex-col w-full p-4 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12">
          {/* Signup with Google */}
          <div className="p-6 rounded-t">
            <div className="mb-3 text-center">
              <h6>S'inscrire avec</h6>
            </div>
            <div className="text-center btn-wrapper">
              <GoogleLogin
                clientId={process.env.GOOGLE_CLIENT_ID as string}
                render={(renderProps) => (
                  <button
                    className="inline-flex items-center p-2 text-xs font-bold text-gray-800 bg-white rounded shadow outline-none focus:outline-none hover:shadow-md"
                    type="button"
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                  >
                    <img
                      alt="Google"
                      className="w-5 mr-1"
                      src="/svg/googleLogo.svg"
                    />
                    Google
                  </button>
                )}
                onSuccess={(res) => setGoogleUser(res as GoogleLoginResponse)}
                onFailure={setGoogleAuthError}
              />
              {googleAuthError && (
                <p className="mt-4 form-submit-error">
                  Une erreur est survenue
                </p>
              )}
            </div>
          </div>

          <hr className="mb-6 border-gray-500 border-b-1" />

          {/* Signup with credentials */}
          <div className="flex-auto px-4 py-10 pt-0 lg:px-10">
            <div className="mb-3 text-center">
              <h6>Ou avec des identifiants</h6>
            </div>

            {/* Full Name */}
            <div className="relative flex flex-row justify-between mb-3">
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
            <div className="relative w-full mb-3">
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

            {/* Password confirmation */}
            <div className="relative w-full mb-3">
              <label className="block mb-2">Confirmer votre mot de passe</label>
              <input
                type="password"
                className="w-full px-3 py-3 placeholder-gray-400"
                placeholder="Confirmez votre mot de passe"
                name="passwordConfirmation"
                onChange={formHelper.handleInputChange.bind(formHelper)}
                value={formHelper.fieldsInformation.passwordConfirmation.value}
              />
              <p className="form-field-error">
                {formHelper.fieldsInformation.passwordConfirmation.error}
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
                Créer mon compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signin */}
      <div className="mt-6 text-lg font-semibold text-center text-gray-800">
        <Link href="/auth/signin">
          <small className="cursor-pointer">
            Vous avez déjà un compte ? Connectez-vous.
          </small>
        </Link>
      </div>
    </div>
  )
}

export default withApollo(Signup)

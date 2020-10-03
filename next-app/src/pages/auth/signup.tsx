import React from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/react-hooks'
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import { withApollo } from '../../apollo/client'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import FillMissingAccountInformation from '../../components/adminSite/FillMissingAccountInformation'
import storeJWT from '../../utils/storeJWT'
import { AuthPayloadOperations } from '../../models/AuthPayload'
import { useRouter } from 'next/router'

const Signup: React.FunctionComponent = () => {
  // Hook to force component rerender
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [signup] = useMutation(AuthPayloadOperations.credentialsSignupMutation)
  const [oAuthSignin] = useMutation(AuthPayloadOperations.oAuthSigninMutation)

  const [googleUser, setGoogleUser] = React.useState<GoogleLoginResponse>()
  const [googleAuthError, setGoogleAuthError] = React.useState<any>()

  const router = useRouter()
  React.useEffect(() => {
    if (router.query.isGoogleLoginInitialized === 'false') {
      setGoogleAuthError({ error: 'idpiframe_initialization_failed' })
    }
  }, [])

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value.length ? 'Ce champ est obligatoire.' : ''
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
    signup({
      variables: {
        firstName: fieldsInformation.firstName.value,
        lastName: fieldsInformation.lastName.value,
        email: fieldsInformation.email.value,
        password: fieldsInformation.password.value,
      },
    })

  const onSubmitResult = ({ response, error }: any) => {
    if (error) {
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }

    storeJWT(response.data.signup)
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: ['firstName', 'lastName', 'email', 'password'],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  const onGoogleAuthSuccess = async (
    res: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    console.log(res)
    res = res as GoogleLoginResponse
    try {
      var authRes = res.getAuthResponse()
      const response = await oAuthSignin({
        variables: {
          oAuthToken: {
            accessToken: authRes.access_token,
            idToken: authRes.id_token,
          },
        },
      })
      storeJWT(response.data.signin)
    } catch (e) {
      setGoogleUser(res)
    }
  }

  return (
    <div className="absolute flex flex-col justify-center w-full h-full p-4 bg-gray-100">
      {googleUser ? (
        <FillMissingAccountInformation googleUser={googleUser} />
      ) : (
        <div className="container flex flex-col w-full p-6 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12 lg:px-10">
          {/* Signup with Google */}
          {!googleAuthError ||
          googleAuthError.error !== 'idpiframe_initialization_failed' ? (
            <>
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
                  onSuccess={onGoogleAuthSuccess}
                  onFailure={setGoogleAuthError}
                  cookiePolicy={'single_host_origin'}
                />
                {googleAuthError && (
                  <p className="mt-4 form-submit-error">
                    Une erreur est survenue. Veuillez-réessayer.
                  </p>
                )}
              </div>

              <hr className="my-6 border-gray-500 border-b-1" />

              <div className="mb-3 text-center">
                <h6>Ou avec des identifiants</h6>
              </div>
            </>
          ) : (
            <div className="mb-3 text-center">
              <h5>Enregistrez-vous</h5>
            </div>
          )}

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
            <div className="flex password-input-container">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                className="w-full px-3 py-3 placeholder-gray-400 shadow-none focus:shadow-none"
                placeholder="Votre mot de passe"
                name="password"
                onChange={formHelper.handleInputChange.bind(formHelper)}
                value={formHelper.fieldsInformation.password.value}
              />
              <button
                className="px-2 focus:outline-none"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                tabIndex={-1}
              >
                {isPasswordVisible ? (
                  <FontAwesomeIcon icon={faEyeSlash} size="lg" />
                ) : (
                  <FontAwesomeIcon icon={faEye} size="lg" />
                )}
              </button>
            </div>
            <p className="form-field-error">
              {formHelper.fieldsInformation.password.error}
            </p>
          </div>

          {/* Submit */}
          <div className="mt-3 text-center">
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
      )}

      {/* Signin */}
      <div className="mt-6 text-lg font-semibold text-center text-gray-800">
        <Link
          href={
            '/auth/signin' +
            (googleAuthError?.error === 'idpiframe_initialization_failed'
              ? '?isGoogleLoginInitialized=false'
              : '')
          }
        >
          <small className="cursor-pointer">
            Vous avez déjà un compte ? Connectez-vous.
          </small>
        </Link>
      </div>
    </div>
  )
}

export default withApollo(Signup)

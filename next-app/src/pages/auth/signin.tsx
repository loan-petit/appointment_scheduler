import React from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/react-hooks'
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login'

import { withApollo } from '../../apollo/client'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import FillMissingAccountInformation from '../../components/adminSite/FillMissingAccountInformation'
import storeJWT from '../../utils/storeJWT'
import { AuthPayloadOperations } from '../../models/AuthPayload'
import { useRouter } from 'next/router'

const Signin = () => {
  // Hook to force component rerender
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [credentialsSignin] = useMutation(
    AuthPayloadOperations.credentialsSignin,
  )
  const [oAuthSignin] = useMutation(AuthPayloadOperations.oAuthSignin)

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
    credentialsSignin({
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
        } else if (message == 'This user has no associated credentials.') {
          return 'Le compte associé à cette adresse email à été créé avec un service tiers.'
        }
      }
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }

    storeJWT(response.data.signin)
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

  const onGoogleAuthSuccess = async (
    res: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
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
        <FillMissingAccountInformation
          googleUser={googleUser}
          fromSignin={true}
        />
      ) : (
        <div className="container flex flex-col w-full p-6 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12 lg:px-10">
          {/* Signin with Google
            /!\ This part is disabled due to some problems in production
            To enable it again, please update the next condition by remove the "false && ..." part
          */}
          {false &&
          (!googleAuthError ||
            googleAuthError.error !== 'idpiframe_initialization_failed') ? (
            <>
              <div className="mb-3 text-center">
                <h6>Se connecter avec</h6>
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
                {googleAuthError &&
                  googleAuthError.error !== 'popup_closed_by_user' && (
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
              <h5>Connectez-vous</h5>
            </div>
          )}

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
              Se connecter
            </button>
          </div>
        </div>
      )}

      {/* Signup */}
      <div className="mt-3 text-lg font-semibold text-center text-gray-800">
        <Link
          href={
            '/auth/signup' +
            (googleAuthError?.error === 'idpiframe_initialization_failed'
              ? '?isGoogleLoginInitialized=false'
              : '')
          }
        >
          <small className="cursor-pointer">Pas de compte ? Créez-en un.</small>
        </Link>
      </div>
    </div>
  )
}

export default withApollo(Signin)

import * as React from 'react'
import { GoogleLoginResponse } from 'react-google-login'
import { useMutation } from '@apollo/react-hooks'

import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import storeJWT from '../../utils/storeJWT'
import { AuthPayloadOperations } from '../../models/AuthPayload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

type Props = {
  googleUser: GoogleLoginResponse
  fromSignin?: boolean
}

const FillMissingAccountInformation: React.FunctionComponent<Props> = ({
  googleUser,
  fromSignin = false,
}) => {
  // Hook to force component rerender
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [signup] = useMutation(AuthPayloadOperations.oAuthSignupMutation)

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

  const onSubmit = (fieldsInformation: FieldsInformation) => {
    var authRes = googleUser.getAuthResponse()
    return signup({
      variables: {
        firstName: fieldsInformation.firstName.value,
        lastName: fieldsInformation.lastName.value,
        email: fieldsInformation.email.value,
        password: fieldsInformation.password.value,
        oAuthToken: {
          accessToken: authRes.access_token,
          idToken: authRes.id_token,
        },
      },
    })
  }

  const onSubmitResult = ({ response, error }: any) => {
    if (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (
          message.includes('Unique constraint failed on the fields: (`email`)')
        ) {
          return "Un compte est déjà associé à cette adresse email. Si vous souhaitez lier ce compte à votre compte Google, veuillez-vous connecter et le faire depuis l'onglet paramètres."
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
        { name: 'firstName', value: googleUser.profileObj.givenName },
        { name: 'lastName', value: googleUser.profileObj.familyName },
        { name: 'email', value: googleUser.profileObj.email },
        'password',
      ],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <div className="container flex flex-col w-full p-8 mx-auto break-words bg-gray-300 rounded-lg shadow-lg lg:w-5/12">
      <div className="mb-8 text-center">
        {fromSignin && (
          <h6>Vous n'avez pas encore de compte, nous allons en créer un.</h6>
        )}
        <h6>
          {googleUser.profileObj.name && googleUser.profileObj.email
            ? 'Confirmez-vous ces informations ? Elles seront visibles par vos clients. Vous pourrez les modifier par la suite dans la section paramètres.'
            : 'Nous avons besoin de quelques informations supplémentaires pour créer votre compte...'}
        </h6>
      </div>

      {/* Full Name */}
      <div className="flex flex-row justify-between mb-3">
        <div className="w-full mr-2">
          <label className="block mb-2">Prénom <span className="required">*</span></label>
          <input
            type="text"
            className="w-full p-3 placeholder-gray-400"
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
          <label className="block mb-2">Nom <span className="required">*</span></label>
          <input
            type="text"
            className="w-full p-3 placeholder-gray-400"
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
      <div className="w-full mb-3">
        <label className="block mb-2">E-mail <span className="required">*</span></label>
        <input
          type="email"
          className="w-full p-3 placeholder-gray-400"
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
        <label className="block mb-2">Mot de passe <span className="required">*</span></label>
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
  )
}

export default FillMissingAccountInformation

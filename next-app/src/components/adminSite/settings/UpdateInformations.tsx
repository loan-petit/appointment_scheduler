import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

import FormHelper, { FieldsInformation } from '../../../utils/FormHelper'
import User, { UserFragments } from '../../../models/User'

const UpdateCurrentUserMutation = gql`
  mutation UpdateCurrentUserMutation(
    $email: String
    $firstName: String
    $lastName: String
    $websiteUrl: String
    $address: String
    $minScheduleNotice: Int
  ) {
    updateCurrentUser(
      email: $email
      firstName: $firstName
      lastName: $lastName
      websiteUrl: $websiteUrl
      address: $address
      minScheduleNotice: $minScheduleNotice
    ) {
      ...UserFields
    }
  }
  ${UserFragments.fields}
`

type Props = {
  currentUser: User
}

const UpdateInformations: React.FunctionComponent<Props> = ({
  currentUser,
}) => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [updateCurrentUser] = useMutation(UpdateCurrentUserMutation)

  const emailRegex = RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  const urlRegex = RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
  )

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value.length ? 'Ce champ est obligatoire.' : ''
      case 'email':
        return !emailRegex.test(value) ? 'Veuillez entrer un email valide.' : ''
      case 'websiteUrl':
        return value && !urlRegex.test(value)
          ? 'Veuillez entrer une URL valide.'
          : ''
      case 'minScheduleNotice':
        return isNaN(value) ? 'Ce champ doit contenir une durée.' : ''
      default:
        return ''
    }
  }

  const onSubmit = (fieldsInformation: FieldsInformation) =>
    updateCurrentUser({
      variables: {
        firstName: fieldsInformation.firstName.value,
        lastName: fieldsInformation.lastName.value,
        email: fieldsInformation.email.value,
        websiteUrl: fieldsInformation.websiteUrl.value,
        phone: fieldsInformation.phone.value,
        address: fieldsInformation.address.value,
        minScheduleNotice: Number(fieldsInformation.minScheduleNotice.value),
      },
    })

  const onSubmitResult = ({ error }: any) => {
    if (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        let message = error.graphQLErrors[0].message
        if (
          message.includes('Unique constraint failed on the fields: (`email`)')
        ) {
          return 'Un autre compte est déjà associé à cette adresse email.'
        }
      }
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: [
        { name: 'firstName', value: currentUser.firstName },
        { name: 'lastName', value: currentUser.lastName },
        { name: 'email', value: currentUser.email },
        { name: 'phone', value: currentUser.phone ?? '' },
        { name: 'websiteUrl', value: currentUser.websiteUrl ?? '' },
        { name: 'address', value: currentUser.address ?? '' },
        { name: 'minScheduleNotice', value: currentUser.minScheduleNotice },
      ],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  return (
    <>
      {/* Full Name */}
      <div className='flex flex-row justify-between mb-3'>
        <div className='w-full mr-2'>
          <label className='block mb-2'>Prénom</label>
          <input
            type='text'
            className='w-full p-3 placeholder-gray-400'
            placeholder='Votre prénom'
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name='firstName'
            value={formHelper.fieldsInformation.firstName.value}
            autoFocus
          />
          <p className='form-field-error'>
            {formHelper.fieldsInformation.firstName.error}
          </p>
        </div>
        <div className='w-full ml-2'>
          <label className='block mb-2'>Nom</label>
          <input
            type='text'
            className='w-full p-3 placeholder-gray-400'
            placeholder='Votre nom'
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name='lastName'
            value={formHelper.fieldsInformation.lastName.value}
          />
          <p className='form-field-error'>
            {formHelper.fieldsInformation.lastName.error}
          </p>
        </div>
      </div>

      {/* Email */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>E-mail</label>
        <input
          type='email'
          className='w-full p-3 placeholder-gray-400'
          placeholder='Votre e-mail'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name='email'
          value={formHelper.fieldsInformation.email.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.email.error}
        </p>
      </div>

      {/* Website URL */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>Site web</label>
        <input
          type='text'
          className='w-full p-3 placeholder-gray-400'
          placeholder="L'URL de votre site web"
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name='websiteUrl'
          value={formHelper.fieldsInformation.websiteUrl.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.websiteUrl.error}
        </p>
      </div>

      {/* Phone */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>Téléphone</label>
        <input
          type='tel'
          className='w-full p-3 placeholder-gray-400'
          placeholder='Votre numéro de téléphone'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name='phone'
          value={formHelper.fieldsInformation.phone.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.phone.error}
        </p>
      </div>

      {/* Address */}
      <div className='w-full mb-3'>
        <label className='block mb-2'>Adresse postale</label>
        <input
          type='text'
          className='w-full p-3 placeholder-gray-400'
          placeholder='Votre adresse'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name='address'
          value={formHelper.fieldsInformation.address.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.address.error}
        </p>
      </div>

      {/* Minimum schedule notice*/}
      <div className='w-full mb-3'>
        <label className='block mb-2'>
          Durée minimale avant planification (en minutes)
        </label>
        <input
          type='number'
          className='w-full px-3 py-3 placeholder-gray-400'
          placeholder='Durée minimale avant planification'
          onChange={formHelper.handleInputChange.bind(formHelper)}
          name='minScheduleNotice'
          value={formHelper.fieldsInformation.minScheduleNotice.value}
        />
        <p className='form-field-error'>
          {formHelper.fieldsInformation.minScheduleNotice.error}
        </p>
      </div>

      {/* Submit to change information */}
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
          Sauvegarder
        </button>
      </div>
    </>
  )
}

export default UpdateInformations

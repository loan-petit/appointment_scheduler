import React from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'

import { withApollo } from '../../apollo/client'
import Layout from '../../components/adminSite/Layout'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import LoadingOverlay from '../../components/shared/LoadingOverlay'
import User from '../../models/User'
import AppointmentType, {
  AppointmentTypeFragments,
  AppointmentTypeOperations,
} from '../../models/AppointmentType'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`

const AppointmentTypeQuery = gql`
  query AppointmentTypeQuery($appointmentTypeId: Int!) {
    appointmentType(where: { id: $appointmentTypeId }) {
      ...AppointmentTypeFields
    }
  }
  ${AppointmentTypeFragments.fields}
`

const UpsertOneAppointmentTypeMutation = gql`
  mutation UpsertOneAppointmentTypeMutation(
    $appointmentTypeId: Int!
    $name: String!
    $description: String
    $duration: Int!
    $price: Float
    $generateClientSheet: Boolean
    $userId: Int!
  ) {
    upsertOneAppointmentType(
      create: {
        name: $name
        description: $description
        duration: $duration
        price: $price
        generateClientSheet: $generateClientSheet
        user: { connect: { id: $userId } }
      }
      update: {
        name: { set: $name }
        description: { set: $description }
        duration: { set: $duration }
        price: { set: $price }
        generateClientSheet: { set: $generateClientSheet }
      }
      where: { id: $appointmentTypeId }
    ) {
      ...AppointmentTypeFields
    }
  }
  ${AppointmentTypeFragments.fields}
`

const UpsertOneAppointmentType = () => {
  const router = useRouter()

  // Hook to force component rerender
  const [, updateState] = React.useState<object>()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [currentUser, setCurrentUser] = React.useState<User>()
  const [appointmentType, setAppointmentType] = React.useState<
    AppointmentType
  >()

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const appointmentTypeQueryResult = useQuery(AppointmentTypeQuery, {
    variables: { appointmentTypeId: Number(router.query.id) },
    skip: !router.query.id,
  })
  const [upsertOneAppointmentType] = useMutation(
    UpsertOneAppointmentTypeMutation,
    {
      update(cache, { data: { upsertOneAppointmentType } }) {
        const { user }: any = cache.readQuery({
          query: AppointmentTypeOperations.appointmentTypes,
          variables: { userId: currentUser?.id },
        })
        if (
          user.appointmentTypes.some(
            (e: AppointmentType) => e.id == upsertOneAppointmentType.id,
          )
        )
          return

        cache.writeQuery({
          query: AppointmentTypeOperations.appointmentTypes,
          variables: { userId: currentUser?.id },
          data: {
            __typename: 'User',
            user: {
              ...user,
              appointmentTypes: user.appointmentTypes.concat([
                upsertOneAppointmentType,
              ]),
            },
          },
        })
      },
    },
  )

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'name':
        return !value.length ? 'Ce champ est obligatoire.' : ''
      case 'duration':
        return !value || isNaN(value) ? 'Ce champ doit contenir une durée.' : ''
      case 'price':
        return isNaN(value) ? 'Ce champ doit contenir un prix.' : ''
      default:
        return ''
    }
  }

  const onSubmit = (
    fieldsInformation: FieldsInformation,
    additionalVariables: any,
  ) =>
    upsertOneAppointmentType({
      variables: {
        name: fieldsInformation.name.value,
        description: fieldsInformation.description.value,
        duration: Number(fieldsInformation.duration.value),
        price: Number(fieldsInformation.price.value),
        generateClientSheet: fieldsInformation.generateClientSheet.value,
        ...additionalVariables,
      },
    })

  const onSubmitResult = ({ error }: any) => {
    if (error) {
      return 'Une erreur est survenue. Veuillez-réessayer.'
    }
    return ''
  }

  const [formHelper] = React.useState(
    new FormHelper({
      fields: [
        'name',
        'description',
        'duration',
        'price',
        { name: 'generateClientSheet', value: false },
      ],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  else if (currentUserQueryResult.error) {
    router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
  }

  // Verify AppointmentTypeQuery result
  if (router.query.id) {
    if (appointmentTypeQueryResult.loading) return <LoadingOverlay />
    else if (appointmentTypeQueryResult.error) {
      return (
        <p className="error-message">
          Une erreur est survenue. Veuillez-réessayer.
        </p>
      )
    }
    if (!appointmentType) {
      formHelper.updateFieldValues(
        appointmentTypeQueryResult.data.appointmentType,
      )
      setAppointmentType(appointmentTypeQueryResult.data.appointmentType)
    }
  }

  return (
    <Layout>
      <div className="md:w-1/2">
        <header className="mb-6">
          <h5>Informations de l'événement</h5>
        </header>

        {/* Name */}
        <div className="w-full mb-3">
          <label className="block mb-2">Nom</label>
          <input
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Nom de l'événement"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="name"
            value={formHelper.fieldsInformation.name.value}
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.name.error}
          </p>
        </div>

        {/* Description */}
        <div className="w-full mb-3">
          <label className="block mb-2">Description</label>
          <textarea
            rows={4}
            cols={80}
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Description de l'événement"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="description"
            value={formHelper.fieldsInformation.description.value}
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.description.error}
          </p>
        </div>

        {/* Duration */}
        <div className="w-full mb-3">
          <label className="block mb-2">Durée (en minutes)</label>
          <input
            type="number"
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Durée"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="duration"
            value={formHelper.fieldsInformation.duration.value}
            autoFocus
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.duration.error}
          </p>
        </div>

        {/* Price */}
        <div className="w-full mb-3">
          <label className="block mb-2">Prix (en €)</label>
          <input
            type="number"
            className="w-full px-3 py-3 placeholder-gray-400"
            placeholder="Prix"
            onChange={formHelper.handleInputChange.bind(formHelper)}
            name="price"
            value={formHelper.fieldsInformation.price.value}
          />
          <p className="form-field-error">
            {formHelper.fieldsInformation.price.error}
          </p>
        </div>

        {/* Generate Client Sheet */}
        <div className="mb-6">
          <label className="text-gray-700 normal-case md:w-2/3">
            <input
              className="mr-2"
              type="checkbox"
              name="generateClientSheet"
              onChange={formHelper.handleInputChange.bind(formHelper)}
              checked={formHelper.fieldsInformation.generateClientSheet.value}
            />
            <span className="text-xs">Générer une fiche client</span>
          </label>
        </div>

        {/* Submit to change information */}
        <div className="mt-6">
          {(() => {
            if (formHelper.submitStatus.response) {
              return (
                <p className="pt-0 pb-4 text-sm italic text-green-500">
                  {router.query.id
                    ? "L'événement a bien été mis à jour."
                    : "L'événement a bien été créé."}
                </p>
              )
            } else if (formHelper.submitStatus.userFriendlyError.length) {
              return (
                <p className="pt-0 pb-4 form-submit-error">
                  {formHelper.submitStatus.userFriendlyError}
                </p>
              )
            } else return null
          })()}
          <button
            className="px-6 py-3 submit-button"
            onClick={(e) => {
              formHelper.handleSubmit.bind(formHelper)(e, {
                appointmentTypeId: Number(router.query.id) || -1,
                userId: currentUser?.id,
              })
            }}
          >
            Valider
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default withApollo(UpsertOneAppointmentType)

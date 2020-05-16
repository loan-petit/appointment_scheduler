import React from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import Router, { useRouter } from 'next/router'

import { withApollo } from '../../apollo/client'
import Layout from '../../components/Layout'
import FormHelper, { FieldsInformation } from '../../utils/FormHelper'
import LoadingOverlay from '../../components/LoadingOverlay'
import User from '../../models/User'

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    me {
      user {
        id
      }
    }
  }
`

const EventQuery = gql`
  query EventQuery($eventId: Int!) {
    event(where: { id: $eventId }) {
      id
      name
      description
      duration
      price
      generateClientSheet
    }
  }
`

const CreateOneEventMutation = gql`
  mutation CreateOneEventMutation(
    $name: String!
    $description: String
    $duration: Int!
    $price: Float
    $generateClientSheet: Boolean
    $ownerId: Int!
  ) {
    createOneEvent(
      data: {
        name: $name
        description: $description
        duration: $duration
        price: $price
        generateClientSheet: $generateClientSheet
        owner: { connect: { id: $ownerId } }
      }
    ) {
      id
      name
      description
      duration
      price
      generateClientSheet
    }
  }
`

const UpdateOneEventMutation = gql`
  mutation UpsertOneEventMutation(
    $eventId: Int!
    $name: String!
    $description: String
    $duration: Int!
    $price: Float
    $generateClientSheet: Boolean
  ) {
    updateOneEvent(
      where: { id: $eventId }
      data: {
        name: $name
        description: $description
        duration: $duration
        price: $price
        generateClientSheet: $generateClientSheet
      }
    ) {
      id
      name
      description
      duration
      price
      generateClientSheet
    }
  }
`

const UpsertOneEvent = () => {
  const router = useRouter()

  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const [currentUser, setCurrentUser] = React.useState<User>()
  const [event, setEvent] = React.useState<Event>()

  const currentUserQueryResult = useQuery(CurrentUserQuery)
  const eventQueryResult = useQuery(EventQuery, {
    variables: { eventId: Number(router.query.id) },
    skip: !router.query.id,
  })
  const [createOneEvent] = useMutation(CreateOneEventMutation)
  const [updateOneEvent] = useMutation(UpdateOneEventMutation)

  const fieldsValidator = (name: String, value: any) => {
    switch (name) {
      case 'name':
        return !value.length ? 'Ce champ est obligatoire.' : ''
      case 'duration':
        return isNaN(value) ? 'Ce champ doit contenir une durée.' : ''
      case 'price':
        return isNaN(value) ? 'Ce champ doit contenir un prix.' : ''
      default:
        return ''
    }
  }

  const onSubmit = (
    fieldsInformation: FieldsInformation,
    additionalVariables: any,
  ) => {
    const variables = {
      name: fieldsInformation.name.value,
      description: fieldsInformation.description.value,
      duration: Number(fieldsInformation.duration.value),
      price: Number(fieldsInformation.price.value),
      generateClientSheet: Boolean(fieldsInformation.generateClientSheet.value),
      ...additionalVariables,
    }

    if (additionalVariables.eventId) {
      return updateOneEvent({
        variables: variables,
      })
    } else {
      return createOneEvent({
        variables: variables,
      })
    }
  }

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
        'generateClientSheet',
      ],
      refreshComponent: forceUpdate,
      fieldsValidator: fieldsValidator,
      onSubmit: onSubmit,
      onSubmitResult: onSubmitResult,
    }),
  )

  // Verify CurrentUserQuery result
  if (currentUserQueryResult.loading) return <LoadingOverlay />
  if (currentUserQueryResult.error) {
    Router.push('/auth/signin')
    return <div />
  }
  if (!currentUser) {
    setCurrentUser(currentUserQueryResult.data.me.user)
  }

  // Verify EventQuery result
  if (router.query.id) {
    if (eventQueryResult.loading) return <LoadingOverlay />
    if (eventQueryResult.error) {
      return (
        <p className="error-message">
          Une erreur est survenue. Veuillez-réessayer.
        </p>
      )
    }
    if (!event) {
      formHelper.updateFieldValues(eventQueryResult.data.event)
      setEvent(eventQueryResult.data.event)
    }
  }

  return (
    <Layout>
      <div className="md:w-1/2">
        <div className="mb-6">
          <h5>Informations de l'événement</h5>
        </div>

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
              value={formHelper.fieldsInformation.generateClientSheet.value}
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
            onClick={(e) =>
              formHelper.handleSubmit.bind(formHelper)(
                e,
                router.query.id
                  ? { eventId: Number(router.query.id) }
                  : { ownerId: currentUser?.id },
              )
            }
          >
            Valider
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default withApollo(UpsertOneEvent)

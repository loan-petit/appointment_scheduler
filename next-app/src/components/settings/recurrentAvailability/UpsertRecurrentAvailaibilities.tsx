import React from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'

import LoadingOverlay from '../../LoadingOverlay'
import User from '../../../models/User'
import RecurrentAvailability, {
  RecurrentAvailabilityFragments,
  RecurrentAvailabilityHelpers,
} from '../../../models/RecurrentAvailability'
import Day, { dayToUserFriendlyString } from '../../../models/enums/Day'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import RecurrentAvailabilityTimePicker from './RecurrentAvailabilityTimePicker'
import getMaxId from '../../../utils/getMaxId'

const RecurrentAvailabilitiesQuery = gql`
  query RecurrentAvailabilitiesQuery($userId: Int!) {
    user(where: { id: $userId }) {
      recurrentAvailabilities {
        ...RecurrentAvailabilityFields
      }
    }
  }
  ${RecurrentAvailabilityFragments.fields}
`

const UpsertOneRecurrentAvailabilityMutation = gql`
  mutation UpsertOneRecurrentAvailabilityMutation(
    $recurrentAvailabilityId: Int!
    $day: String!
    $startTime: String
    $endTime: Int!
    $userId: Int!
  ) {
    upsertOneRecurrentAvailability(
      create: {
        day: $day
        startTime: $startTime
        endTime: $endTime
        user: { connect: { id: $userId } }
      }
      update: { day: $day, startTime: $startTime, endTime: $endTime }
      where: { id: $recurrentAvailabilityId }
    ) {
      ...RecurrentAvailabilityFields
    }
  }
  ${RecurrentAvailabilityFragments.fields}
`

type Props = {
  currentUser: User
}

const UpsertOneRecurrentAvailability: React.FunctionComponent<Props> = ({
  currentUser,
}) => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  var [recurrentAvailabilities, setRecurrentAvailabilities] = React.useState<
    RecurrentAvailability[]
  >()

  const recurrentAvailabilitiesQueryResult = useQuery(
    RecurrentAvailabilitiesQuery,
    {
      variables: { userId: currentUser.id },
    },
  )
  // const [upsertOneRecurrentAvailability] =
  useMutation(UpsertOneRecurrentAvailabilityMutation, {
    update(cache, { data: { upsertOneRecurrentAvailability } }) {
      const { user }: any = cache.readQuery({
        query: RecurrentAvailabilitiesQuery,
        variables: { userId: currentUser.id },
      })
      if (
        user.recurrentAvailabilities.some(
          (e: RecurrentAvailability) =>
            e.id == upsertOneRecurrentAvailability.id,
        )
      )
        return

      cache.writeQuery({
        query: RecurrentAvailabilitiesQuery,
        variables: { userId: currentUser.id },
        data: {
          __typename: 'User',
          user: {
            __typename: 'User',
            ...user,
            recurrentAvailabilities: user.recurrentAvailabilities.concat([
              upsertOneRecurrentAvailability,
            ]),
          },
        },
      })
    },
  })

  // Verify RecurrentAvailabilityQuery result
  if (recurrentAvailabilitiesQueryResult.loading) return <LoadingOverlay />
  else if (recurrentAvailabilitiesQueryResult.error) {
    return (
      <p className="error-message">
        Une erreur est survenue. Veuillez-réessayer.
      </p>
    )
  }
  if (!recurrentAvailabilities) {
    setRecurrentAvailabilities(
      RecurrentAvailabilityHelpers.addMissingDays(
        recurrentAvailabilitiesQueryResult.data.user.recurrentAvailabilities,
      ),
    )
  }
  if (!recurrentAvailabilities) return <div />

  const recurrentAvailabilitiesGroupedByDay = RecurrentAvailabilityHelpers.groupByDay(
    recurrentAvailabilities,
  )

  const addRecurrentAvailability = (day: string) => {
    if (!recurrentAvailabilities) return

    setRecurrentAvailabilities(
      recurrentAvailabilities.concat([
        {
          id: getMaxId(recurrentAvailabilities) + 1,
          day: day,
        },
      ]),
    )
  }

  const removeRecurrentAvailability = (id: number) => {
    if (!recurrentAvailabilities) return
    setRecurrentAvailabilities(
      recurrentAvailabilities.filter((v) => v.id != id),
    )
  }

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (!recurrentAvailabilities) return

    // Convert value in hh:mm format to seconds
    var split = e.target.value.split(':')
    var seconds = +split[0] * 60 * 60 + +split[1] * 60

    if (e.target.name === 'startTime') {
      recurrentAvailabilities[index].startTime = seconds
    } else if (e.target.name === 'endTime') {
      recurrentAvailabilities[index].endTime = seconds
    }
    setRecurrentAvailabilities(recurrentAvailabilities)
    forceUpdate()
  }

  return (
    <>
      <div className="mb-6">
        <h5>Définir vos disponibilitées par défaut</h5>
      </div>

      {/* Display recurrent availabilities grouped by day */}
      {Object.entries(recurrentAvailabilitiesGroupedByDay).map(
        ([key, group]) => (
          <div key={key} className="mt-2 md:flex md:flex-row md:items-center">
            <label className="md:w-2/12">{dayToUserFriendlyString(key)}</label>

            <div className="p-2">
              {/* Update a recurrent availability */}
              {group?.map((recurrentAvailability, i) => {
                if (!recurrentAvailabilities) return null

                const index = recurrentAvailabilities.findIndex(
                  (v) => v.id == recurrentAvailability.id,
                )
                return (
                  <RecurrentAvailabilityTimePicker
                    key={i}
                    recurrentAvailability={recurrentAvailability}
                    updateField={(e) => updateField(e, index)}
                    removeField={
                      i
                        ? () =>
                            removeRecurrentAvailability(
                              recurrentAvailability.id,
                            )
                        : undefined
                    }
                  />
                )
              })}

              {/* Add a recurrent availability */}
              <a
                className="flex flex-row items-center pt-2 pb-4 text-sm"
                onClick={() =>
                  addRecurrentAvailability(Day[Number(key) as Day])
                }
              >
                <FontAwesomeIcon icon={faPlus} size="sm" />
                <p className="pl-2">Ajouter une disponibilité</p>
              </a>
            </div>
          </div>
        ),
      )}
    </>
  )
}

export default UpsertOneRecurrentAvailability

import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import User from '../../../models/User'
import RecurrentAvailability, {
  RecurrentAvailabilityFragments,
  RecurrentAvailabilityHelpers,
  RecurrentAvailabilityOperations,
} from '../../../models/RecurrentAvailability'
import Day, { dayToUserFriendlyString } from '../../../types/Day'
import RecurrentAvailabilityTimePicker from './RecurrentAvailabilityFields'
import getMaxId from '../../../utils/getMaxId'
import { SubmitStatus } from '../../../utils/FormHelper'
import { convertTimeStringToSeconds } from '../../../utils/timeStringHelper'

const UpsertOneRecurrentAvailabilityMutation = gql`
  mutation UpsertOneRecurrentAvailabilityMutation(
    $recurrentAvailabilityId: Int!
    $day: Day!
    $startTime: Int!
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

const DeleteOneRecurrentAvailabilityMutation = gql`
  mutation DeleteOneRecurrentAvailabilityMutation(
    $recurrentAvailabilityId: Int!
  ) {
    deleteOneRecurrentAvailability(where: { id: $recurrentAvailabilityId }) {
      ...RecurrentAvailabilityFields
    }
  }
  ${RecurrentAvailabilityFragments.fields}
`

type Props = {
  currentUser: User
  recurrentAvailabilities: RecurrentAvailability[]
}

const UpsertRecurrentAvailabilities: React.FunctionComponent<Props> = ({
  currentUser,
  recurrentAvailabilities,
}) => {
  // Hook to force component rerender
  const [, updateState] = React.useState()
  const forceUpdate = React.useCallback(() => updateState({}), [])

  var [
    invalidAvailabilityRanges,
    setInvalidAvailabilityRanges,
  ] = React.useState<number[]>([])
  const [submitStatus, setSumbitStatus] = React.useState<SubmitStatus>({
    isSubmitted: false,
    userFriendlyError: '',
  })

  const [upsertOneRecurrentAvailability] = useMutation(
    UpsertOneRecurrentAvailabilityMutation,
    {
      update(cache, { data: { upsertOneRecurrentAvailability } }) {
        const { user }: any = cache.readQuery({
          query: RecurrentAvailabilityOperations.recurrentAvailabilities,
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
          query: RecurrentAvailabilityOperations.recurrentAvailabilities,
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
    },
  )
  const [deleteOneRecurrentAvailability] = useMutation(
    DeleteOneRecurrentAvailabilityMutation,
    {
      update(cache, { data: { deleteOneRecurrentAvailability } }) {
        const { user }: any = cache.readQuery({
          query: RecurrentAvailabilityOperations.recurrentAvailabilities,
          variables: { userId: currentUser?.id },
        })

        const removedRecurrentAvailabilityIndex = user.recurrentAvailabilities.findIndex(
          (e: RecurrentAvailability) =>
            e.id == deleteOneRecurrentAvailability.id,
        )
        if (removedRecurrentAvailabilityIndex > -1) {
          user.recurrentAvailabilities.splice(
            removedRecurrentAvailabilityIndex,
            1,
          )
        }

        cache.writeQuery({
          query: RecurrentAvailabilityOperations.recurrentAvailabilities,
          variables: { userId: currentUser?.id },
          data: {
            __typename: 'User',
            user: {
              ...user,
              recurrentAvailabilities: user.recurrentAvailabilities,
            },
          },
        })
      },
    },
  )

  recurrentAvailabilities = RecurrentAvailabilityHelpers.addMissingDays(
    recurrentAvailabilities,
  )
  const recurrentAvailabilitiesGroupedByDay = RecurrentAvailabilityHelpers.groupByDay(
    recurrentAvailabilities,
  )

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const seconds = convertTimeStringToSeconds(e.target.value)

    if (e.target.name === 'startTime') {
      recurrentAvailabilities[index].startTime = seconds
    } else if (e.target.name === 'endTime') {
      recurrentAvailabilities[index].endTime = seconds
    }

    forceUpdate()
  }

  const addRecurrentAvailability = (day: string) => {
    recurrentAvailabilities.push({
      id: getMaxId(recurrentAvailabilities) + 1,
      day: day,
    })

    forceUpdate()
  }

  const removeRecurrentAvailability = (index: number) => {
    const recurrentAvailability = recurrentAvailabilities[index]
    if (recurrentAvailability.user) {
      deleteOneRecurrentAvailability({
        variables: { recurrentAvailabilityId: recurrentAvailability.id },
      })
    }

    recurrentAvailabilities.splice(index, 1)
    recurrentAvailabilities = RecurrentAvailabilityHelpers.addMissingDays(
      recurrentAvailabilities,
    )

    forceUpdate()
  }

  const handleSubmit = () => {
    var recurrentAvailabilitiesToUpsert: RecurrentAvailability[] = []
    invalidAvailabilityRanges = []

    recurrentAvailabilities?.map(async (v) => {
      if (!v.startTime && !v.endTime) {
        return
      } else if (!v.startTime || !v.endTime) {
        return invalidAvailabilityRanges.push(v.id)
      }
      recurrentAvailabilitiesToUpsert.push(v)
    })

    if (invalidAvailabilityRanges.length) {
      return setInvalidAvailabilityRanges(invalidAvailabilityRanges)
    }

    recurrentAvailabilitiesToUpsert.map(async (v) => {
      try {
        await upsertOneRecurrentAvailability({
          variables: {
            day: v.day,
            startTime: v.startTime,
            endTime: v.endTime,
            recurrentAvailabilityId: v.user ? v.id : -1,
            userId: currentUser.id,
          },
        })
        setSumbitStatus({
          isSubmitted: true,
          userFriendlyError: '',
        })
      } catch (e) {
        setSumbitStatus({
          isSubmitted: true,
          userFriendlyError: 'Une erreur est survenue. Veuillez-réessayer.',
        })
      }
    })
  }

  return (
    <>
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
                    remove={() => removeRecurrentAvailability(index)}
                    isRangeInvalid={invalidAvailabilityRanges.includes(
                      recurrentAvailability.id,
                    )}
                  />
                )
              })}

              {/* Add a recurrent availability */}
              <a
                className="flex flex-row items-center pt-2 pb-4 text-sm"
                onClick={() => {
                  if (!group) return

                  if (
                    group[group.length - 1].startTime ||
                    group[group.length - 1].endTime
                  )
                    addRecurrentAvailability(Day[Number(key) as Day])
                }}
              >
                <FontAwesomeIcon icon={faPlus} size="sm" />
                <p className="pl-2">Ajouter une disponibilité</p>
              </a>
            </div>
          </div>
        ),
      )}

      {/* Submit to upsert recurrent availabilities */}
      {(() => {
        if (submitStatus.isSubmitted) {
          return (
            <p className="pt-2 text-sm italic text-green-500">
              Les créneaux de disponibilités enregistrés ont bien été pris en
              compte.
            </p>
          )
        } else if (submitStatus.userFriendlyError.length) {
          return (
            <p className="pt-2 form-submit-error">
              {submitStatus.userFriendlyError}
            </p>
          )
        } else return null
      })()}
      <div className="mt-6">
        <button className="px-6 py-3 submit-button" onClick={handleSubmit}>
          Sauvegarder
        </button>
      </div>
    </>
  )
}

export default UpsertRecurrentAvailabilities

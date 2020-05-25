import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import TimeField from 'react-simple-timefield'

import RecurrentAvailability from '../../../models/RecurrentAvailability'
import WarningModal from '../../WarningModal'
import convertSecondsToTimeString from '../../../utils/convertSecondsToTimeString'

type Props = {
  recurrentAvailability: RecurrentAvailability
  updateField: (e: React.ChangeEvent<HTMLInputElement>) => void
  remove: () => void
  isRangeInvalid: boolean
}

const RecurrentAvailabilityTimePicker: React.FunctionComponent<Props> = ({
  recurrentAvailability,
  updateField,
  remove,
  isRangeInvalid,
}) => {
  const [showWarningModal, setShowWarningModal] = React.useState(false)

  return (
    <div className="my-4">
      <div className="flex flex-row items-center">
        <div className="flex flex-col mr-2">
          <label className="text-xs normal-case">Heure de début</label>
          <TimeField
            input={
              <input
                name="startTime"
                className="w-full p-2 mt-2 placeholder-gray-400"
              />
            }
            value={
              recurrentAvailability.startTime
                ? convertSecondsToTimeString(recurrentAvailability.startTime)
                : ''
            }
            onChange={updateField}
          />
        </div>

        <div className="flex flex-col ml-2">
          <label className="text-xs normal-case">Heure de fin</label>
          <TimeField
            input={
              <input
                name="endTime"
                className="w-full p-2 mt-2 placeholder-gray-400"
              />
            }
            value={
              recurrentAvailability.endTime
                ? convertSecondsToTimeString(recurrentAvailability.endTime)
                : ''
            }
            onChange={updateField}
          />
        </div>

        {recurrentAvailability.startTime || recurrentAvailability.endTime ? (
          <button className="ml-4" onClick={() => setShowWarningModal(true)}>
            <FontAwesomeIcon
              icon={faTimes}
              className="text-red-500"
              size="lg"
            />
          </button>
        ) : null}
      </div>

      {isRangeInvalid && (
        <p className="form-field-error">
          Vous devez spécifier l'heure de début et l'heure de fin
        </p>
      )}

      <WarningModal
        warningMessage="Vous êtes sur le point de supprimer un créneau de disponibilité récurrent, confirmez-vous cette action ?"
        onCancel={() => setShowWarningModal(false)}
        onConfirm={() => {
          remove()
          setShowWarningModal(false)
        }}
        isShown={showWarningModal}
      />
    </div>
  )
}

export default RecurrentAvailabilityTimePicker

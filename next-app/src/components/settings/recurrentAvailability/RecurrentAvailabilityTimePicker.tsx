import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import TimeField from 'react-simple-timefield'

import RecurrentAvailability from '../../../models/RecurrentAvailability'

type Props = {
  recurrentAvailability: RecurrentAvailability
  updateField: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeField?: () => void
}

const RecurrentAvailabilityTimePicker: React.FunctionComponent<Props> = ({
  recurrentAvailability,
  updateField,
  removeField,
}) => {
  const convertSecondsToTimeString = (seconds: number) =>
    new Date(seconds * 1000).toISOString().substr(11, 8)

  return (
    <div className="flex flex-row items-center my-1">
      <div className="flex flex-col mr-2">
        <label className="text-xs normal-case">Heure de début</label>
        <TimeField
          input={
            <input
              name="startTime"
              className="w-full p-2 my-2 placeholder-gray-400"
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
              className="w-full p-2 my-2 placeholder-gray-400"
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
      {removeField && (
        <button onClick={removeField} className="ml-4">
          <FontAwesomeIcon icon={faTimes} className="text-red-500" size="lg" />
        </button>
      )}
    </div>
  )
}

export default RecurrentAvailabilityTimePicker

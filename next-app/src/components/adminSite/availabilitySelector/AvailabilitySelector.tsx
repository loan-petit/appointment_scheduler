import * as React from 'react'
import moment from 'moment'

import Availability from '../../../models/AvailabilityModifier'

moment.locale('fr')

const weekdaysMin = moment
  .weekdaysMin()
  .map((v) => v.charAt(0).toUpperCase() + v.substring(1) + '.')

const hours = new Array(24 * 2)
  .fill(0)
  .map((_: number, index: number) =>
    moment({ hour: index / 2, minute: index % 2 ? 30 : 0 }).format('HH:mm'),
  )

type Props = {
  availabilities: Availability[]
  onDateSelected: (date: Date) => void
}

const AvailabilitySelector: React.FunctionComponent<Props> = ({
  availabilities,
  onDateSelected,
}) => {
  console.log(availabilities)
  console.log(onDateSelected)

  console.log(hours)

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        {weekdaysMin.map((v, i) => (
          <p key={i} className="w-full text-xs text-center">
            {v}
          </p>
        ))}
      </div>
      {hours.map((v, i) => (
        <div className="flex flex-row">
          <p key={i} className="text-xs text-center">
            {v}
          </p>
          {weekdaysMin.map((_, j) => (
            <div key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default AvailabilitySelector

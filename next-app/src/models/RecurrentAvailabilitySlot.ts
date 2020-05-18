import User from './User'

type RecurrentAvailabilitySlot = {
  id: number
  day: string
  startTime: number
  endTime: number
  user?: User
}

export default RecurrentAvailabilitySlot

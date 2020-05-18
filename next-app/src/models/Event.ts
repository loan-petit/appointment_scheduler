import User from "./User"

type Event = {
  id: number
  name: string
  description?: string
  duration: number
  price?: number
  generateClientSheet?: boolean
  user?: User
}

export default Event

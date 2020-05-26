import moment from 'moment'

import MomentInterval from '../types/MomentInterval'

export type IndexedMomentInterval = {
  index: number
  interval: MomentInterval
}

export type EventSurroundings = {
  equal: IndexedMomentInterval[]
  inclusive: IndexedMomentInterval[]
  adjacent: {
    inclusive: {
      start: IndexedMomentInterval[]
      end: IndexedMomentInterval[]
    }
    exclusive: {
      start: IndexedMomentInterval[]
      end: IndexedMomentInterval[]
    }
  }
}

const getSurroundingEvents = (
  event: MomentInterval,
  events: IndexedMomentInterval[],
) => {
  var surroundings: EventSurroundings = {
    equal: [],
    inclusive: [],
    adjacent: {
      inclusive: {
        start: [],
        end: [],
      },
      exclusive: {
        start: [],
        end: [],
      },
    },
  }

  events.forEach((v) => {
    if (
      moment(v.interval.start).isSame(event.start) &&
      moment(v.interval.end).isSame(event.end)
    ) {
      surroundings.equal.push(v)
    } else if (
      moment(v.interval.start).isBefore(event.start) &&
      moment(v.interval.end).isAfter(event.end)
    ) {
      surroundings.inclusive.push(v)
    } else if (moment(v.interval.start).isSame(event.start)) {
      if (moment(v.interval.end).isAfter(event.end)) {
        surroundings.adjacent.inclusive.start.push(v)
      } else {
        surroundings.adjacent.exclusive.start.push(v)
      }
    } else if (moment(v.interval.end).isSame(event.end)) {
      if (moment(v.interval.start).isBefore(event.start)) {
        surroundings.adjacent.inclusive.end.push(v)
      } else {
        surroundings.adjacent.exclusive.end.push(v)
      }
    }
  })

  return surroundings
}

export default getSurroundingEvents

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

  events.forEach(v => {
    if (
      moment(event.start).isSame(v.interval.start) &&
      moment(event.end).isSame(v.interval.end)
    ) {
      surroundings.equal.push(v)
    } else if (
      moment(event.start).isBefore(v.interval.start) &&
      moment(event.end).isAfter(v.interval.end)
    ) {
      surroundings.inclusive.push(v)
    } else if (moment(event.start).isSame(v.interval.start)) {
      surroundings.adjacent.inclusive.start.push(v)
    } else if (moment(event.start).isSame(v.interval.end)) {
      surroundings.adjacent.exclusive.start.push(v)
    } else if (moment(event.end).isSame(v.interval.end)) {
      surroundings.adjacent.inclusive.end.push(v)
    } else if (moment(event.end).isSame(v.interval.start)) {
      surroundings.adjacent.exclusive.end.push(v)
    }
  })

  return surroundings
}

export default getSurroundingEvents

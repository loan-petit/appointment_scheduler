import moment from 'moment'
import MomentInterval from '../types/MomentInterval'

const isIntervalAllDay = (start: Date, end: Date) => {
  const momentInterval: MomentInterval = {
    start: moment(start),
    end: moment(end),
  }

  const isAllDay =
    momentInterval.start.hours() == 0 &&
    momentInterval.start.minutes() == 0 &&
    momentInterval.end.hours() == 23 &&
    momentInterval.end.minutes() == 59

  return isAllDay
}

export default isIntervalAllDay

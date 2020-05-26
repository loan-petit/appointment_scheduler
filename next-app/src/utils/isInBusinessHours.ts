import moment from 'moment'

import Day from '../types/Day'
import { convertTimeStringToSeconds } from './timeStringHelper'
import MomentInterval from '../types/MomentInterval'

export type BusinessHour = {
  daysOfWeek: Day[]
  startTime: string
  endTime: string
}

const isInBusinessHours = (
  event: MomentInterval,
  businessHours: BusinessHour[],
) => {
  var momentIsInBusinessHours = false

  businessHours.map((businessHour) => {
    const businessHourMoment = {
      start: moment(
        convertTimeStringToSeconds(businessHour.startTime) * 1000,
      ).utc(),
      end: moment(
        convertTimeStringToSeconds(businessHour.endTime) * 1000,
      ).utc(),
    }

    businessHour.daysOfWeek.map((day: Day) => {
      const slot = {
        start: event.start
          .clone()
          .day(day)
          .hour(businessHourMoment.start.hour())
          .minute(businessHourMoment.start.minute()),
        end: event.end
          .clone()
          .day(day)
          .hour(businessHourMoment.end.hour())
          .minute(businessHourMoment.end.minute()),
      }

      if (
        event.start.isBetween(slot.start, slot.end, undefined, '[]') &&
        event.end.isBetween(slot.start, slot.end, undefined, '[]')
      ) {
        momentIsInBusinessHours = true
      }
    })
  })

  return momentIsInBusinessHours
}

export default isInBusinessHours

import moment, { Moment } from 'moment'

import Day from '../models/enums/Day'
import { convertTimeStringToSeconds } from './timeStringHelper'
import { EventInput } from '@fullcalendar/core'

export type BusinessHour = {
  daysOfWeek: Day[]
  startTime: string
  endTime: string
}

export type MomentInterval = {
  start: Moment
  end: Moment
}

const isInBusinessHours = (
  event: EventInput,
  businessHours: BusinessHour[],
) => {
  var momentIsInBusinessHours = false
  var eventMoment: MomentInterval = { start: moment(), end: moment() }

  if (event.allDay) {
    eventMoment.start = moment(event.startTime).startOf('day')
    eventMoment.end = moment(event.startTime).endOf('day')
  } else {
    eventMoment.start = moment(event.startTime)
    eventMoment.end = moment(event.endTime)
  }

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
        start: eventMoment.start
          .clone()
          .day(day)
          .hour(businessHourMoment.start.hour())
          .minute(businessHourMoment.start.minute()),
        end: eventMoment.end
          .clone()
          .day(day)
          .hour(businessHourMoment.end.hour())
          .minute(businessHourMoment.end.minute()),
      }

      if (
        eventMoment.start.isBetween(slot.start, slot.end, undefined, '[]') &&
        eventMoment.end.isBetween(slot.start, slot.end, undefined, '[]')
      ) {
        momentIsInBusinessHours = true
      }
    })
  })

  return momentIsInBusinessHours
}

export default isInBusinessHours

enum Day {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}

export const dayToUserFriendlyString = (day: Day | string) => {
  if (typeof day === 'string') {
    if (isNaN(Number(day))) {
      day = Object.values(Day).indexOf(day)
    } else {
      day = Number(day)
    }
  }

  switch (day) {
    case Day.MONDAY:
      return 'Lundi'
    case Day.TUESDAY:
      return 'Mardi'
    case Day.WEDNESDAY:
      return 'Mercredi'
    case Day.THURSDAY:
      return 'Jeudi'
    case Day.FRIDAY:
      return 'Vendredi'
    case Day.SATURDAY:
      return 'Samedi'
    case Day.SUNDAY:
      return 'Dimanche'
    default:
      return ''
  }
}

export default Day

enum Day {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
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
    case Day.SUNDAY:
      return 'Dimanche'
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
    default:
      return ''
  }
}

export default Day

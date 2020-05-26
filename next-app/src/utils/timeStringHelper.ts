// Convert value in seconds to hh:mm format
export const convertSecondsToTimeString = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substr(11, 5)

// Convert value in hh:mm format to seconds
export const convertTimeStringToSeconds = (time: string) => {
  var split = time.split(':')
  return +split[0] * 60 * 60 + +split[1] * 60
}

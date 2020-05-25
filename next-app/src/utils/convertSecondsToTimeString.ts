const convertSecondsToTimeString = (seconds: number) =>
  new Date(seconds * 1000).toISOString().substr(11, 5)

export default convertSecondsToTimeString

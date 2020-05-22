const getMaxId = (array: Array<any>) => {
  if (!array.length) return 0

  return Math.max.apply(
    Math,
    array.map(function (v) {
      return v.id
    }),
  )
}

export default getMaxId

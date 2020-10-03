class ResolverError extends Error {
  constructor(m: string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ResolverError.prototype)
  }
}

export default ResolverError
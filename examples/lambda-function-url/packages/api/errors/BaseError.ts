export default class BaseError extends Error {
  rootCause: string|null = null
  constructor(name, message, rootCause, ...params) {
    super(...params)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseError)
    }
    this.name = name
    this.message = message
    this.rootCause = rootCause
  }
}

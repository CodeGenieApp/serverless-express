import BaseError from './BaseError'

export default class UnauthenticatedError extends BaseError {
  errors = []
  constructor(errors?: any, rootCause?: any, ...params) {
    super('UnauthenticatedError', 'Not authenticated', rootCause, ...params)
    this.errors = errors
  }
}

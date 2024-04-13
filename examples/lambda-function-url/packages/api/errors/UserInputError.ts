import BaseError from './BaseError'

export default class UserInputError extends BaseError {
  errors: string[] = []
  constructor(errors: string[], rootCause?: any, ...params) {
    super('UserInputError', 'Invalid input', rootCause, ...params)
    this.errors = errors
  }
}

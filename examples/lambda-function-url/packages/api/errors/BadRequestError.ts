import BaseError from './BaseError'

export default class BadRequestError extends BaseError {
  constructor(message, rootCause, ...params) {
    super('BadRequestError', message, rootCause, ...params)
  }
}

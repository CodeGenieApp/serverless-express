import BaseError from './BaseError'

export default class NotFoundError extends BaseError {
  constructor(message, rootCause?: any, ...params) {
    super('NotFoundError', message, rootCause, ...params)
  }
}

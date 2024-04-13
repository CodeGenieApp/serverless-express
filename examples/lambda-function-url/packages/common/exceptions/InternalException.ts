export default class InternalException extends Error {
  readonly $fault = 'internal'
}
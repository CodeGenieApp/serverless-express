export default class ClientException extends Error {
  readonly $fault = 'client'
}
import ClientError from '../../common/exceptions/ClientException'
import type { StringMap } from '../../common/types'

export default class UnsupportedIdentityProviderNameException extends ClientError {
  readonly name = this.constructor.name
  constructor({ providerName, validIdentityProviderNamesMap }: { providerName: string, validIdentityProviderNamesMap: StringMap }) {
    super(`Unsupported Identity Provider: ${providerName}. Valid Identity Providers: ${JSON.stringify(validIdentityProviderNamesMap)}.`)
  }
}
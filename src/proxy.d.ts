import { RequestListener } from "http"

interface ProxyParams {
  app: RequestListener,
  binaryMimeTypes?: string[],
  binarySettings?: BinarySettings
}

interface BinarySettings {
  isBinary?: Function | boolean,
  contentTypes?: string[]
}

declare function proxy(proxyParams: ProxyParams): Promise<any>

export default ProxyParams

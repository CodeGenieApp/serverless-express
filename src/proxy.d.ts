import { RequestListener } from "http"

interface ProxyParams {
  app: RequestListener,
  binaryMimeTypes?: string[]
}

declare function proxy(proxyParams: ProxyParams): Promise

export default ProxyParams

import { RequestListener } from "http"

interface ProxyParams {
  app: RequestListener,
  binaryMimeTypes?: string[]
}

declare function proxy(proxyParams: ProxyParams): Promise<any>

export default ProxyParams

import { RequestListener } from "http"
import { Handler } from "aws-lambda"
import Logger from "./logger"
import ProxyParams from "./proxy"

interface ConfigureParams {
  app: RequestListener,
  binaryMimeTypes?: string[],
  binarySettings?: BinarySettings
}

interface BinarySettings {
  isBinary?: Function | boolean,
  contentTypes?: string[]
}

interface ConfigureResult {
  handler: Handler,
  log: Logger,
  proxy: (proxyParams: ProxyParams) => Promise<Object>
}

declare function configure(configureParams: ConfigureParams): ConfigureResult

export default configure
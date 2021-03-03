import { RequestListener } from "http";
import { Handler } from "aws-lambda";
import Logger from "./logger";

interface EventSource {
  getRequest?: any; // TODO:
  getResponse?: any; // TODO:
}
interface ProxyParams {
  app: RequestListener;
  binaryMimeTypes?: string[];
  binarySettings?: BinarySettings;
}

interface BinarySettings {
  isBinary?: Function | boolean;
  contentTypes?: string[];
}
interface ConfigureParams {
  app: RequestListener;
  binaryMimeTypes?: string[];
  binarySettings?: BinarySettings;
  eventSource?: EventSource; // TODO:
}

interface BinarySettings {
  isBinary?: Function | boolean;
  contentTypes?: string[];
}

interface ConfigureResult {
  handler: Handler;
  log: Logger;
  proxy: (proxyParams: ProxyParams) => Promise<Object>;
}

declare function configure(configureParams: ConfigureParams): Handler & ConfigureResult;

// declare function proxy(proxyParams: ProxyParams): Promise<any>

export default configure;

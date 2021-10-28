import { RequestListener } from "http";
import { Handler } from "aws-lambda";
import Logger from "./logger";

type EventSources = "AWS_SNS" | "AWS_DYNAMODB";

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
  eventSourceRoutes?: { [key in EventSources]?: string };
}

interface BinarySettings {
  isBinary?: Function | boolean;
  contentTypes?: string[];
}

interface ConfigureResult<TEvent = any, TResult = any> {
  handler: Handler<TEvent, TResult>;
  log: Logger;
  proxy: (proxyParams: ProxyParams) => Promise<Object>;
}

declare function configure<TEvent = any, TResult = any>(configureParams: ConfigureParams): Handler<TEvent, TResult> & ConfigureResult<TEvent, TResult>;

// declare function proxy(proxyParams: ProxyParams): Promise<any>

export default configure;

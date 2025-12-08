import { RequestListener } from 'http';
import { Handler } from 'aws-lambda';
import { Logger } from './logger';
import Framework from './frameworks';

type EventSources = 'AWS_SNS' | 'AWS_DYNAMODB' | 'AWS_EVENTBRIDGE' | 'AWS_SQS' | 'AWS_KINESIS_DATA_STREAM' | 'AWS_S3' | 'AWS_STEP_FUNCTIONS' | 'AWS_SELF_MANAGED_KAFKA';

interface EventSource {
  getRequest?: any; // TODO:
  getResponse?: any; // TODO:
}

interface BinarySettings {
  isBinary?: Function | boolean;
  contentTypes?: string[];
  contentEncodings?: string[];
}

interface LogSettings {
  level: string;
}

interface ConfigureParams {
  app: RequestListener;
  logSettings?: LogSettings;
  log?: Logger;
  framework?: Framework;
  binarySettings?: BinarySettings;
  eventSourceName?: string;
  eventSource?: EventSource;
  eventSourceRoutes?: { [key in EventSources]?: string };
  respondWithErrors?: boolean;
}

export interface ConfigureResult<TEvent = any, TResult = any> {
  log: Logger;
}

declare function configure<TEvent = any, TResult = any>(configureParams: ConfigureParams): Handler<TEvent, TResult> & ConfigureResult<TEvent, TResult>;

export default configure;

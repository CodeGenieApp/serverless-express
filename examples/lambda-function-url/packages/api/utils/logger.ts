import { createLogger, format, transports } from 'winston'

const NODE_ENV_LOG_LEVEL_MAP = {
  test: 'error',
  development: 'debug',
  production: 'data', // NOTE: Use log.data to emit to CloudWatch Metric Filters
}
const logLevel = process.env.LOG_LEVEL || NODE_ENV_LOG_LEVEL_MAP[process.env.NODE_ENV || 'development']
const combinedFormat =
  process.env.IS_LOCAL === '1'
    ? format.combine(format.json({ space: 2 }), format.prettyPrint({ colorize: true }))
    : format.combine(format.json())

export const logger = createLogger({
  level: logLevel,
  format: combinedFormat,
  transports: new transports.Console({
    handleExceptions: false,
    handleRejections: false,
  }),
  exitOnError: false,
})

let logMetadata = { awsRequestId: null }
// eslint-disable-next-line import/no-mutable-exports
export let log = logger.child(logMetadata)

export function setLogMetadata({ metadata }) {
  log = logger.child(metadata)
  logMetadata = { ...metadata }
}

export function addLogMetadata({ metadata }) {
  const newLogMetadata = {
    ...logMetadata,
    ...metadata,
  }
  log = logger.child(newLogMetadata)
  logMetadata = newLogMetadata
}

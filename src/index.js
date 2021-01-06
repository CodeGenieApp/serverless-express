const { createLogger, format, transports } = require('winston')
const {
  forwardRequestToNodeServer,
  forwardLibraryErrorResponseToApiGateway,
  makeResolver
} = require('./transport')
const { getEventFnsBasedOnEventSource } = require('./event-sources')
const { getEventSourceBasedOnEvent } = require('./event-sources/utils')
const { getFramework } = require('./frameworks')

const currentLambdaInvoke = {}

function getCurrentLambdaInvoke () {
  return currentLambdaInvoke
}

function setCurrentLambdaInvoke ({ event, context }) {
  currentLambdaInvoke.event = event
  currentLambdaInvoke.context = context
}

function proxy ({
  app,
  framework = getFramework({ app }),
  event = {},
  context = {},
  callback = null,
  resolutionMode = 'PROMISE',
  eventSource = getEventSourceBasedOnEvent({ event }),
  binaryMimeTypes,
  eventFns = getEventFnsBasedOnEventSource({ eventSource }),
  logger,
  respondWithErrors
}) {
  logger.debug('Calling proxy', { event, context, resolutionMode, eventSource })
  setCurrentLambdaInvoke({ event, context })
  return new Promise((resolve, reject) => {
    const promise = {
      resolve,
      reject
    }
    const resolver = makeResolver({
      context,
      callback,
      promise,
      resolutionMode
    })

    try {
      forwardRequestToNodeServer({
        app,
        framework,
        event,
        context,
        resolver,
        eventSource,
        binaryMimeTypes,
        eventFns,
        logger
      })
    } catch (error) {
      forwardLibraryErrorResponseToApiGateway({
        error,
        resolver,
        logger,
        respondWithErrors,
        eventResponseMapperFn: eventFns.response
      })
    }
  })
}

const DEFAULT_LOGGER_CONFIG = {
  level: 'warning',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
}

function configure ({
  app: configureApp,
  framework: configureFramework = getFramework({ app: configureApp }),
  binaryMimeTypes: configureBinaryMimeTypes = [],
  resolutionMode: configureResolutionMode = 'PROMISE',
  eventSource: configureEventSource,
  eventFns: configureEventFns,
  respondWithErrors: configureRespondWithErrors = true, // process.env.NODE_ENV === 'development',
  loggerConfig: configureLoggerConfig = {},
  logger: configureLogger = createLogger({
    ...DEFAULT_LOGGER_CONFIG,
    ...configureLoggerConfig
  }),
  proxy: configureProxy = ({
    app: configureProxyApp = configureApp,
    framework: configureProxyFramework = configureFramework,
    resolutionMode = configureResolutionMode,
    event,
    context,
    callback,
    eventSource = configureEventSource,
    binaryMimeTypes = configureBinaryMimeTypes,
    eventFns = configureEventFns,
    logger = configureLogger,
    respondWithErrors = configureRespondWithErrors
  } = {}) => (proxy({
    app: configureProxyApp,
    framework: configureProxyFramework,
    event,
    context,
    resolutionMode,
    callback,
    eventSource,
    binaryMimeTypes,
    eventFns,
    logger,
    respondWithErrors
  })),
  handler: configureHandler = (event, context, callback) => configureProxy({
    event,
    context,
    callback
  })
} = {}) {
  return {
    proxy: configureProxy,
    handler: configureHandler,
    logger: configureLogger
  }
}

module.exports = {
  configure,
  getCurrentLambdaInvoke
}

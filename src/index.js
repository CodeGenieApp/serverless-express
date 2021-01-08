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
  log,
  respondWithErrors
}) {
  log.debug('SERVERLESS_EXPRESS:PROXY', {
    event,
    context,
    resolutionMode,
    eventSource,
    binaryMimeTypes,
    respondWithErrors
  })
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
        log
      })
    } catch (error) {
      forwardLibraryErrorResponseToApiGateway({
        error,
        resolver,
        log,
        respondWithErrors,
        eventResponseMapperFn: eventFns.response
      })
    }
  })
}

const DEFAULT_LOGGER = {
  info (message, additional) {
    console.info(message, additional)
  },
  debug (message, additional) {
    console.debug(message, additional)
  },
  error (message, additional) {
    console.error(message, additional)
  }
}

function configure ({
  app: configureApp,
  framework: configureFramework = getFramework({ app: configureApp }),
  binaryMimeTypes: configureBinaryMimeTypes = [],
  resolutionMode: configureResolutionMode = 'PROMISE',
  eventSource: configureEventSource,
  eventFns: configureEventFns,
  respondWithErrors: configureRespondWithErrors = process.env.NODE_ENV === 'development',
  log: configureLogger = DEFAULT_LOGGER,
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
    log = configureLogger,
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
    log,
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
    log: configureLogger
  }
}

module.exports = {
  configure,
  getCurrentLambdaInvoke
}

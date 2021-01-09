const { getFramework } = require('./frameworks')
const logger = require('./logger')
const proxy = require('./proxy')

function configure ({
  app: configureApp,
  framework: configureFramework = getFramework({ app: configureApp }),
  binaryMimeTypes: configureBinaryMimeTypes = [],
  resolutionMode: configureResolutionMode = 'PROMISE',
  eventSource: configureEventSource,
  eventFns: configureEventFns,
  respondWithErrors: configureRespondWithErrors = process.env.NODE_ENV === 'development',
  log: configureLogger = logger,
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
  } = {}) => proxy({
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
  }),
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

module.exports = configure

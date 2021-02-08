const { getFramework } = require('./frameworks')
const logger = require('./logger')
const proxy = require('./proxy')

function configure ({
  app: configureApp,
  logSettings,
  log: configureLog = logger(logSettings),
  framework: configureFramework = getFramework({ app: configureApp, log: configureLog }),
  binaryMimeTypes: configureBinaryMimeTypes,
  binarySettings: configureBinarySettings,
  resolutionMode: configureResolutionMode = 'PROMISE',
  eventSourceName: configureEventSourceName,
  eventSource: configureEventFns,
  respondWithErrors: configureRespondWithErrors = process.env.NODE_ENV === 'development',
  proxy: configureProxy = ({
    app: configureProxyApp = configureApp,
    framework: configureProxyFramework = configureFramework,
    resolutionMode = configureResolutionMode,
    event,
    context,
    callback,
    eventSourceName = configureEventSourceName,
    binaryMimeTypes = configureBinaryMimeTypes,
    binarySettings = configureBinarySettings,
    eventSource = configureEventFns,
    log = configureLog,
    respondWithErrors = configureRespondWithErrors
  } = {}) => proxy({
    app: configureProxyApp,
    framework: configureProxyFramework,
    event,
    context,
    resolutionMode,
    callback,
    eventSourceName,
    binaryMimeTypes,
    binarySettings,
    eventSource,
    log,
    respondWithErrors
  }),
  handler: configureHandler = (event, context, callback) => configureProxy({
    event,
    context,
    callback
  })
} = {}) {
  configureHandler.handler = configureHandler
  configureHandler.proxy = configureProxy
  configureHandler.log = configureLog
  return configureHandler
}

module.exports = configure

const util = require('util')
const logger = require('./logger')
const { setCurrentInvoke } = require('./current-invoke')
const { getEventSource } = require('./event-sources')
const { getEventSourceNameBasedOnEvent } = require('./event-sources/utils')
const { getFramework } = require('./frameworks')
const makeResolver = require('./make-resolver')
const { forwardRequestToNodeServer, respondToEventSourceWithError } = require('./transport')
const { DEFAULT_BINARY_ENCODINGS, DEFAULT_BINARY_CONTENT_TYPES } = require('./constants')

function getDefaultBinarySettings (deprecatedBinaryMimeTypes) {
  return {
    contentTypes: deprecatedBinaryMimeTypes || DEFAULT_BINARY_CONTENT_TYPES,
    contentEncodings: DEFAULT_BINARY_ENCODINGS
  }
}

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
  eventSourceRoutes: configureEventSourceRoutes,
  respondWithErrors: configureRespondWithErrors = process.env.NODE_ENV === 'development'
} = {}) {
  function proxy ({
    app = configureApp,
    framework = configureFramework,
    event = {},
    context = {},
    callback = null,
    resolutionMode = configureResolutionMode,
    eventSourceName = configureEventSourceName || getEventSourceNameBasedOnEvent({ event }),
    binaryMimeTypes = configureBinaryMimeTypes,
    binarySettings = configureBinarySettings || getDefaultBinarySettings(binaryMimeTypes),
    eventSource = configureEventFns || getEventSource({ eventSourceName }),
    eventSourceRoutes = configureEventSourceRoutes || {},
    log = configureLog,
    respondWithErrors = configureRespondWithErrors
  }) {
    log.debug('SERVERLESS_EXPRESS:PROXY', {
      event: util.inspect(event, { depth: null }),
      context: util.inspect(context, { depth: null }),
      resolutionMode,
      eventSourceName,
      binarySettings,
      respondWithErrors
    })

    if (binaryMimeTypes) {
      console.warn('[DEPRECATION NOTICE] { binaryMimeTypes: [] } is deprecated. base64 encoding is now automatically determined based on response content-type and content-encoding. If you need to manually set binary content types, instead, use { binarySettings: { contentTypes: [] } }')
    }

    setCurrentInvoke({ event, context })
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
          eventSourceName,
          binarySettings,
          eventSource,
          eventSourceRoutes,
          log
        })
      } catch (error) {
        respondToEventSourceWithError({
          error,
          resolver,
          log,
          respondWithErrors,
          eventSourceName,
          eventSource
        })
      }
    })
  }

  function handler (event, context, callback) {
    return proxy({
      event,
      context,
      callback
    })
  }

  handler.handler = (...params) => {
    console.warn('[DEPRECATION NOTICE] You\'re using the deprecated `serverlessExpress({...}).handler({...})` method. This will be removed in a future version of @vendia/serverless-express. Instead, simply return `serverlessExpress({...})` as your handler.')
    return handler(...params)
  }

  handler.proxy = (...params) => {
    console.warn('[DEPRECATION NOTICE] You\'re using the deprecated `serverlessExpress({...}).proxy({...})` method. This will be removed in a future version of @vendia/serverless-express. Instead, simply return `serverlessExpress({...})` as your handler.')
    return proxy(...params)
  }

  handler.log = configureLog

  return handler
}

module.exports = configure

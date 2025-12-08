const util = require('util')
const logger = require('./logger')
const { setCurrentInvoke } = require('./current-invoke')
const { getEventSource } = require('./event-sources')
const { getEventSourceNameBasedOnEvent } = require('./event-sources/utils')
const { getFramework } = require('./frameworks')
const makeResolver = require('./make-resolver')
const { forwardRequestToNodeServer, respondToEventSourceWithError } = require('./transport')
const { DEFAULT_BINARY_ENCODINGS, DEFAULT_BINARY_CONTENT_TYPES } = require('./constants')

function getDefaultBinarySettings () {
  return {
    contentTypes: DEFAULT_BINARY_CONTENT_TYPES,
    contentEncodings: DEFAULT_BINARY_ENCODINGS
  }
}

function configure ({
  app: configureApp,
  logSettings,
  log: configureLog = logger(logSettings),
  framework: configureFramework = getFramework({ app: configureApp, log: configureLog }),
  binarySettings: configureBinarySettings,
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
    eventSourceName = configureEventSourceName || getEventSourceNameBasedOnEvent({ event }),
    binarySettings = configureBinarySettings || getDefaultBinarySettings(),
    eventSource = configureEventFns || getEventSource({ eventSourceName }),
    eventSourceRoutes = configureEventSourceRoutes || {},
    log = configureLog,
    respondWithErrors = configureRespondWithErrors
  }) {
    log.debug('SERVERLESS_EXPRESS:PROXY', () => ({
      event: util.inspect(event, { depth: null }),
      context: util.inspect(context, { depth: null }),
      eventSourceName,
      binarySettings,
      respondWithErrors
    }))

    setCurrentInvoke({ event, context })
    return new Promise((resolve, reject) => {
      const promise = {
        resolve,
        reject
      }
      const resolver = makeResolver({
        promise
      })
      const handleError = (error) => {
        respondToEventSourceWithError({
          error,
          resolver,
          log,
          respondWithErrors,
          eventSourceName,
          eventSource,
          event
        })
      }

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
        }).catch(handleError)
      } catch (error) {
        handleError(error)
      }
    })
  }

  async function handler (event, context) {
    return proxy({
      event,
      context
    })
  }

  handler.log = configureLog

  return handler
}

module.exports = configure

const { setCurrentInvoke } = require('./current-invoke')
const { getEventSource } = require('./event-sources')
const { getEventSourceNameBasedOnEvent } = require('./event-sources/utils')
const { getFramework } = require('./frameworks')
const makeResolver = require('./make-resolver')
const { forwardRequestToNodeServer, respondToEventSourceWithError } = require('./transport')

function proxy ({
  app,
  framework = getFramework({ app }),
  event = {},
  context = {},
  callback = null,
  resolutionMode = 'PROMISE',
  eventSourceName = getEventSourceNameBasedOnEvent({ event }),
  binaryMimeTypes,
  eventSource = getEventSource({ eventSourceName }),
  log,
  respondWithErrors
}) {
  log.debug('SERVERLESS_EXPRESS:PROXY', {
    event,
    context,
    resolutionMode,
    eventSourceName,
    binaryMimeTypes,
    respondWithErrors
  })
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
        binaryMimeTypes,
        eventSource,
        log
      })
    } catch (error) {
      respondToEventSourceWithError({
        error,
        resolver,
        log,
        respondWithErrors,
        eventSource
      })
    }
  })
}

module.exports = proxy

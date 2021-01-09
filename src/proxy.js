const { setCurrentInvoke } = require('./current-invoke')
const { getEventFnsBasedOnEventSource } = require('./event-sources')
const { getEventSourceBasedOnEvent } = require('./event-sources/utils')
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
        eventSource,
        binaryMimeTypes,
        eventFns,
        log
      })
    } catch (error) {
      respondToEventSourceWithError({
        error,
        resolver,
        log,
        respondWithErrors,
        eventResponseMapperFn: eventFns.response
      })
    }
  })
}

module.exports = proxy

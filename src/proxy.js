const util = require('util')
const { setCurrentInvoke } = require('./current-invoke')
const { getEventSource } = require('./event-sources')
const { getEventSourceNameBasedOnEvent } = require('./event-sources/utils')
const { getFramework } = require('./frameworks')
const makeResolver = require('./make-resolver')
const { forwardRequestToNodeServer, respondToEventSourceWithError } = require('./transport')

const DEFAULT_BINARY_ENCODINGS = ['gzip', 'deflate', 'br']
const DEFAULT_BINARY_CONTENT_TYPES = ['image/*']

function getDefaultBinarySettings (deprecatedBinaryMimeTypes) {
  return {
    contentTypes: deprecatedBinaryMimeTypes || DEFAULT_BINARY_CONTENT_TYPES,
    contentEncodings: DEFAULT_BINARY_ENCODINGS
  }
}

function proxy ({
  app,
  framework = getFramework({ app }),
  event = {},
  context = {},
  callback = null,
  resolutionMode = 'PROMISE',
  eventSourceName = getEventSourceNameBasedOnEvent({ event }),
  binaryMimeTypes,
  binarySettings = getDefaultBinarySettings(binaryMimeTypes),
  eventSource = getEventSource({ eventSourceName }),
  log,
  respondWithErrors
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
    console.warn('{ binaryMimeTypes: [] } is deprecated. base64 encoding is now automatically determined based on response content-type and content-encoding. If you need to manually set binary content types, instead, use { binarySettings: { contentTypes: [] } }')
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

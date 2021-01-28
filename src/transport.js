const { getEventSource } = require('./event-sources')
const Response = require('./response')
const isBinary = require('./is-binary')

function forwardResponse ({
  binarySettings,
  response,
  resolver,
  eventSource,
  log
}) {
  const statusCode = response.statusCode
  const headers = Response.headers(response)
  const isBase64Encoded = isBinary({
    headers,
    binarySettings
  })
  const encoding = isBase64Encoded ? 'base64' : 'utf8'
  const body = Response.body(response).toString(encoding)
  const logBody = isBase64Encoded ? '[BASE64_ENCODED]' : body

  log.debug('SERVERLESS_EXPRESS:FORWARD_RESPONSE:EVENT_SOURCE_RESPONSE_PARAMS', {
    statusCode,
    body: logBody,
    headers,
    isBase64Encoded
  })

  const successResponse = eventSource.getResponse({
    statusCode,
    body,
    headers,
    isBase64Encoded,
    response
  })

  log.debug('SERVERLESS_EXPRESS:FORWARD_RESPONSE:EVENT_SOURCE_RESPONSE', {
    successResponse,
    body: logBody
  })

  resolver.succeed({
    response: successResponse
  })
}

function respondToEventSourceWithError ({
  error,
  resolver,
  log,
  respondWithErrors,
  eventSource
}) {
  log.error('SERVERLESS_EXPRESS:RESPOND_TO_EVENT_SOURCE_WITH_ERROR', error)

  const body = respondWithErrors ? error.stack : ''
  const errorResponse = eventSource.getResponse({
    statusCode: 500,
    body,
    headers: {},
    isBase64Encoded: false
  })

  resolver.succeed({ response: errorResponse })
}

async function forwardRequestToNodeServer ({
  app,
  framework,
  event,
  context,
  resolver,
  eventSourceName,
  binarySettings,
  eventSource = getEventSource({ eventSourceName }),
  log
}) {
  const requestValues = eventSource.getRequest({ event, context, log })
  log.debug('SERVERLESS_EXPRESS:FORWARD_REQUEST_TO_NODE_SERVER:REQUEST_VALUES', { requestValues })
  const response = await framework.sendRequest({ app, requestValues })
  log.debug('SERVERLESS_EXPRESS:FORWARD_REQUEST_TO_NODE_SERVER:RESPONSE', { response })
  forwardResponse({
    binarySettings,
    response,
    resolver,
    eventSource,
    log
  })
  return response
}

module.exports = {
  forwardResponse,
  respondToEventSourceWithError,
  forwardRequestToNodeServer
}


const isType = require('type-is')
const { getEventSource } = require('./event-sources')
const Response = require('./response')

function isContentTypeBinaryMimeType ({ contentType, binaryMimeTypes }) {
  return binaryMimeTypes.length > 0 && Boolean(isType.is(contentType, binaryMimeTypes))
}

function getContentType ({ contentTypeHeader }) {
  // only compare mime type; ignore encoding part
  return contentTypeHeader ? contentTypeHeader.split(';')[0] : ''
}

function forwardResponse ({
  binaryMimeTypes,
  response,
  resolver,
  eventSource,
  log
}) {
  const statusCode = response.statusCode
  const headers = Response.headers(response)
  const contentType = getContentType({
    contentTypeHeader: headers['content-type']
  })
  const isBase64Encoded = isContentTypeBinaryMimeType({
    contentType,
    binaryMimeTypes
  })
  const body = Response.body(response).toString(isBase64Encoded ? 'base64' : 'utf8')

  log.debug('SERVERLESS_EXPRESS:FORWARD_RESPONSE:EVENT_SOURCE_RESPONSE_PARAMS', {
    statusCode,
    body,
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

  log.debug('SERVERLESS_EXPRESS:FORWARD_RESPONSE:EVENT_SOURCE_RESPONSE', { successResponse })

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
  binaryMimeTypes,
  eventSource = getEventSource({ eventSourceName }),
  log
}) {
  const requestValues = eventSource.getRequest({ event, context, log })
  log.debug('SERVERLESS_EXPRESS:FORWARD_REQUEST_TO_NODE_SERVER:REQUEST_VALUES', { requestValues })
  const response = await framework.sendRequest({ app, requestValues })
  log.debug('SERVERLESS_EXPRESS:FORWARD_REQUEST_TO_NODE_SERVER:RESPONSE', { response })
  forwardResponse({
    binaryMimeTypes,
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

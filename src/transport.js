
const isType = require('type-is')
const { getEventFnsBasedOnEventSource } = require('./event-sources')
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
  eventResponseMapperFn,
  log,
  event
}) {
  log.debug('SERVERLESS_EXPRESS:FORWARD_RESPONSE:HTTP_RESPONSE', {
    headers: response.headers,
    statusCode: response.statusCode
  })
  const statusCode = response.statusCode
  const headers = Response.headers(response)
  const contentType = getContentType({
    contentTypeHeader: headers['content-type']
  })
  log.debug('SERVERLESS_EXPRESS:FORWARD_RESPONSE:CONTENT_TYPE', { contentType })
  const isBase64Encoded = isContentTypeBinaryMimeType({
    contentType,
    binaryMimeTypes
  })
  const body = Response.body(response).toString(isBase64Encoded ? 'base64' : 'utf8')
  const successResponse = eventResponseMapperFn({
    statusCode,
    body,
    headers,
    isBase64Encoded,
    event
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
  eventResponseMapperFn
}) {
  log.error('SERVERLESS_EXPRESS:RESPOND_TO_EVENT_SOURCE_WITH_ERROR', error)

  const body = respondWithErrors ? error.stack : ''
  const errorResponse = eventResponseMapperFn({
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
  eventSource,
  binaryMimeTypes,
  eventFns = getEventFnsBasedOnEventSource({ eventSource }),
  log
}) {
  const eventResponseMapperFn = eventFns.response
  const requestValues = eventFns.getRequestValues({ event, context, log })
  log.debug('SERVERLESS_EXPRESS:REQUEST_VALUES', { requestValues })
  const response = await framework.sendRequest({ app, requestValues })
  forwardResponse({
    binaryMimeTypes,
    response,
    resolver,
    eventResponseMapperFn,
    log,
    event
  })
  return response
}

module.exports = {
  forwardResponse,
  respondToEventSourceWithError,
  forwardRequestToNodeServer
}

const { getEventFnsBasedOnEventSource } = require('./event-mappings')
const { getContentType, isContentTypeBinaryMimeType } = require('./utils')
const Response = require('./response')

function forwardResponse ({
  binaryMimeTypes,
  response,
  resolver,
  eventResponseMapperFn,
  logger
}) {
  logger.debug('Forwarding response from application to API Gateway... HTTP response:', { headers: response.headers, statusCode: response.statusCode })
  const statusCode = response.statusCode
  const headers = Response.headers(response)
  const contentType = getContentType({
    contentTypeHeader: headers['content-type']
  })
  logger.debug('contentType', { contentType })
  const isBase64Encoded = isContentTypeBinaryMimeType({
    contentType,
    binaryMimeTypes
  })
  const body = Response.body(response).toString(isBase64Encoded ? 'base64' : 'utf8')
  const successResponse = eventResponseMapperFn({
    statusCode,
    body,
    headers,
    isBase64Encoded
  })
  logger.debug('Forwarding response from application to API Gateway... API Gateway response:', { successResponse })
  resolver.succeed({
    response: successResponse
  })
}

function forwardLibraryErrorResponseToApiGateway ({
  error,
  resolver,
  logger,
  respondWithErrors,
  eventResponseMapperFn
}) {
  logger.error('serverless-express error: ', error)

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
  logger
}) {
  logger.debug('Forwarding request to application...')
  const eventResponseMapperFn = eventFns.response
  const requestValues = eventFns.getRequestValues({ event })
  const response = await framework.sendRequest({ app, requestValues })
  forwardResponse({
    binaryMimeTypes,
    response,
    resolver,
    eventResponseMapperFn,
    logger
  })
  return response
}

function makeResolver ({
  context,
  callback,
  promise,
  resolutionMode
}) {
  return {
    succeed: ({ response }) => {
      if (resolutionMode === 'CONTEXT') return context.succeed(response)
      if (resolutionMode === 'CALLBACK') return callback(null, response)
      if (resolutionMode === 'PROMISE') return promise.resolve(response)
    }
  }
}

module.exports = {
  forwardResponse,
  forwardLibraryErrorResponseToApiGateway,
  forwardRequestToNodeServer,
  makeResolver
}

const http = require('http')
const {
  getEventFnsBasedOnEventSource
} = require('./event-mappings')
const {
  getContentType,
  isContentTypeBinaryMimeType
} = require('./utils')

function forwardResponse ({
  server,
  response,
  resolver,
  eventResponseMapperFn,
  logger
}) {
  logger.debug('Forwarding response from application to API Gateway... HTTP response:', { response })
  let buf = []

  response
    .on('data', (chunk) => buf.push(chunk))
    .on('end', () => {
      const bodyBuffer = Buffer.concat(buf)
      const statusCode = response.statusCode
      const headers = response.headers
      const contentType = getContentType({
        contentTypeHeader: headers['content-type']
      })
      logger.debug('contentType', { contentType })
      const isBase64Encoded = isContentTypeBinaryMimeType({
        contentType,
        binaryMimeTypes: server._binaryMimeTypes
      })
      const body = bodyBuffer.toString(isBase64Encoded ? 'base64' : 'utf8')
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
    })
}

function forwardConnectionErrorResponseToApiGateway ({
  error,
  resolver,
  logger,
  respondWithErrors,
  eventResponseMapperFn
}) {
  logger.error('aws-serverless-express connection error: ', error)
  const body = respondWithErrors ? error.stack : ''
  const errorResponse = eventResponseMapperFn({
    statusCode: 502, // "DNS resolution, TCP level errors, or actual HTTP parse errors" - https://nodejs.org/api/http.html#http_http_request_options_callback
    body,
    headers: {},
    isBase64Encoded: false
  })

  resolver.succeed({ response: errorResponse })
}

function forwardLibraryErrorResponseToApiGateway ({
  error,
  resolver,
  logger,
  respondWithErrors,
  eventResponseMapperFn
}) {
  logger.error('aws-serverless-express error: ', error)

  const body = respondWithErrors ? error.stack : ''
  const errorResponse = eventResponseMapperFn({
    statusCode: 500,
    body,
    headers: {},
    isBase64Encoded: false
  })

  resolver.succeed({ response: errorResponse })
}

function forwardRequestToNodeServer ({
  server,
  event,
  context,
  resolver,
  eventSource,
  eventFns = getEventFnsBasedOnEventSource({ eventSource }),
  logger,
  respondWithErrors
}) {
  logger.debug('Forwarding request to application...')
  const eventResponseMapperFn = eventFns.response
  try {
    const socketPath = getSocketPath({ socketPathSuffix: server._socketPathSuffix })
    const { body, ...requestOptions } = eventFns.request({ event })
    logger.debug('requestOptions', requestOptions)
    const req = http.request({ socketPath, ...requestOptions }, (response) => forwardResponse({
      server,
      response,
      resolver,
      eventResponseMapperFn,
      logger
    }))

    if (body) {
      logger.debug('body', body)
      req.write(body)
    }

    req
      .on('error', (error) => forwardConnectionErrorResponseToApiGateway({
        error,
        resolver,
        logger,
        respondWithErrors,
        eventResponseMapperFn
      }))
      .end()
  } catch (error) {
    forwardLibraryErrorResponseToApiGateway({
      error,
      resolver,
      logger,
      respondWithErrors,
      eventResponseMapperFn
    })
  }
}

function startServer ({ server }) {
  return server.listen(getSocketPath({ socketPathSuffix: server._socketPathSuffix }))
}

function getSocketPath ({ socketPathSuffix }) {
  /* only running tests on Linux; Window support is for local dev only */
  /* istanbul ignore if */
  if (/^win/.test(process.platform)) {
    const path = require('path')
    return path.join('\\\\?\\pipe', process.cwd(), `server-${socketPathSuffix}`)
  } else {
    return `/tmp/server-${socketPathSuffix}.sock`
  }
}

function makeResolver ({
  context,
  callback,
  promise,
  resolutionMode
}) {
  // Lambda times out waiting for an empty event loop (which never empties since we have a running server)
  // Setting `context.callbackWaitsForEmptyEventLoop = false` fixes for our use case
  if (resolutionMode === 'CALLBACK') context.callbackWaitsForEmptyEventLoop = false

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
  forwardConnectionErrorResponseToApiGateway,
  forwardLibraryErrorResponseToApiGateway,
  forwardRequestToNodeServer,
  startServer,
  getSocketPath,
  makeResolver
}

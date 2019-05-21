const http = require('http')
const {
  getEventFnsBasedOnEventSource
} = require('./event-mappings')
const {
  getContentType,
  isContentTypeBinaryMimeType,
  getEventBody
} = require('./utils')

function forwardResponse ({ server, response, resolver, eventResponseMapperFn }) {
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
      resolver.succeed({
        response: successResponse
      })
    })
}

function forwardConnectionErrorResponseToApiGateway ({ error, resolver }) {
  console.error('ERROR: aws-serverless-express connection error')
  console.error(error)
  const errorResponse = {
    statusCode: 502, // "DNS resolution, TCP level errors, or actual HTTP parse errors" - https://nodejs.org/api/http.html#http_http_request_options_callback
    body: '',
    multiValueHeaders: {}
  }

  resolver.succeed({
    response: errorResponse
  })
}

function forwardLibraryErrorResponseToApiGateway ({ error, resolver }) {
  console.error('ERROR: aws-serverless-express error')
  console.error(error)
  const errorResponse = {
    statusCode: 500,
    body: '',
    multiValueHeaders: {}
  }

  resolver.succeed({
    response: errorResponse
  })
}

function forwardRequestToNodeServer ({
  server,
  event,
  context,
  resolver,
  eventSource,
  eventFns = getEventFnsBasedOnEventSource({ eventSource })
}) {
  try {
    const requestOptions = eventFns.request({
      event,
      socketPath: getSocketPath({ socketPathSuffix: server._socketPathSuffix })
    })
    const req = http.request(requestOptions, (response) => forwardResponse({ server, response, resolver, eventResponseMapperFn: eventFns.response }))

    if (event.body) {
      const body = getEventBody({ event })
      req.write(body)
    }

    req.on('error', (error) => forwardConnectionErrorResponseToApiGateway({ error, resolver, eventResponseMapperFn: eventFns.response }))
      .end()
  } catch (error) {
    forwardLibraryErrorResponseToApiGateway({ error, resolver })
    return server
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
  return {
    succeed: ({
      response
    }) => {
      if (resolutionMode === 'CONTEXT_SUCCEED') return context.succeed(response)
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

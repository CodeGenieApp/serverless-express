/*
 * Copyright 2016-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file.
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
'use strict'
const http = require('http')
const url = require('url')
const isType = require('type-is')

const currentLambdaInvoke = {}

function getCurrentLambdaInvoke () {
  return currentLambdaInvoke
}

function setCurrentLambdaInvoke ({ event, context }) {
  currentLambdaInvoke.event = event
  currentLambdaInvoke.context = context
}

function getPathWithQueryStringParams ({ event }) {
  return url.format({
    pathname: event.path,
    query: event.multiValueQueryStringParameters
  })
}

function getEventBody ({ event }) {
  return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
}

function getContentType ({ contentTypeHeader }) {
  // only compare mime type; ignore encoding part
  return contentTypeHeader ? contentTypeHeader.split(';')[0] : ''
}

function isContentTypeBinaryMimeType ({ contentType, binaryMimeTypes }) {
  return binaryMimeTypes.length > 0 && !!isType.is(contentType, binaryMimeTypes)
}

function mapEventToHttpRequest ({
  event,
  socketPath,
  headers = {
    ...event.multiValueHeaders
  }
}) {
  return {
    method: event.httpMethod,
    path: getPathWithQueryStringParams({ event }),
    headers,
    socketPath
    // protocol: `${headers['X-Forwarded-Proto']}:`,
    // host: headers.Host,
    // hostname: headers.Host, // Alias for host
    // port: headers['X-Forwarded-Port']
  }
}

function mapApiGatewayEventToHttpRequest ({ event, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  // NOTE: API Gateway is not setting Content-Length header on requests even when they have a body
  if (event.body && !httpRequest.headers['Content-Length']) {
    const body = getEventBody({ event })
    httpRequest.headers['Content-Length'] = Buffer.byteLength(body)
  }

  return httpRequest
}

function mapAlbEventToHttpRequest ({ event, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  return httpRequest
}

function mapLambdaEdgeEventToHttpRequest ({ event, context, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  return httpRequest
}

function forwardResponse ({ server, response, resolver, responseFn }) {
  return responseFn({ server, response, resolver })
}

function forwardResponseToApiGateway ({ server, response, resolver }) {
  let buf = []

  response
    .on('data', (chunk) => buf.push(chunk))
    .on('end', () => {
      const bodyBuffer = Buffer.concat(buf)
      const statusCode = response.statusCode
      const headers = response.headers

      // chunked transfer not currently supported by API Gateway
      /* istanbul ignore else */
      if (headers['transfer-encoding'] === 'chunked') {
        delete headers['transfer-encoding']
      }

      const contentType = getContentType({
        contentTypeHeader: headers['content-type']
      })
      const isBase64Encoded = isContentTypeBinaryMimeType({
        contentType,
        binaryMimeTypes: server._binaryMimeTypes
      })
      const body = bodyBuffer.toString(isBase64Encoded ? 'base64' : 'utf8')
      const successResponse = {
        statusCode,
        body,
        multiValueHeaders: headers,
        isBase64Encoded
      }

      resolver.succeed({
        response: successResponse
      })
    })
}

function forwardConnectionErrorResponseToApiGateway ({ error, resolver }) {
  console.log('ERROR: aws-serverless-express connection error')
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
  console.log('ERROR: aws-serverless-express error')
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

function getEventFnsBasedOnEventSource ({ eventSource }) {
  switch (eventSource) {
    case 'API_GATEWAY':
      return {
        request: mapApiGatewayEventToHttpRequest,
        response: forwardResponseToApiGateway
      }
    case 'ALB':
      return {
        request: mapAlbEventToHttpRequest,
        response: forwardResponseToApiGateway
      }
    case 'LAMBDA_EDGE':
      return {
        request: mapLambdaEdgeEventToHttpRequest,
        response: forwardResponseToApiGateway
      }
    default:
      return {
        request: mapEventToHttpRequest,
        response: forwardResponseToApiGateway
      }
  }
}

function forwardRequestToNodeServer ({
  server,
  event,
  context,
  resolver,
  eventSource,
  eventFns = getEventFnsBasedOnEventSource({ eventSource })
}) {
  setCurrentLambdaInvoke({ event, context })
  try {
    const requestOptions = eventFns.request({
      event,
      socketPath: getSocketPath({ socketPathSuffix: server._socketPathSuffix })
    })
    const req = http.request(requestOptions, (response) => forwardResponse({ server, response, resolver, responseFn: eventFns.response }))

    if (event.body) {
      const body = getEventBody({ event })
      req.write(body)
    }

    req.on('error', (error) => forwardConnectionErrorResponseToApiGateway({ error, resolver, responseFn: eventFns.response }))
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

function getRandomString () {
  return Math.random().toString(36).substring(2, 15)
}

function createServer ({
  app,
  binaryMimeTypes
}) {
  const server = http.createServer(app)

  server._socketPathSuffix = getRandomString()
  server._binaryMimeTypes = binaryMimeTypes ? binaryMimeTypes.slice() : []
  server.on('error', (error) => {
    /* istanbul ignore else */
    if (error.code === 'EADDRINUSE') {
      console.warn(`WARNING: Attempting to listen on socket ${getSocketPath({ socketPathSuffix: server._socketPathSuffix })}, but it is already in use. This is likely as a result of a previous invocation error or timeout. Check the logs for the invocation(s) immediately prior to this for root cause, and consider increasing the timeout and/or cpu/memory allocation if this is purely as a result of a timeout. aws-serverless-express will restart the Node.js server listening on a new port and continue with this request.`)
      server._socketPathSuffix = getRandomString()
      return server.close(() => startServer({ server }))
    } else {
      console.log('ERROR: aws-serverless-express server error')
      console.error(error)
    }
  })

  return server
}

function getEventSourceBasedOnEvent ({
  event
}) {
  if (event && event.requestContext && event.requestContext.elb) return 'ALB'
  if (event && event.requestContext && event.requestContext.stage) return 'API_GATEWAY'
  if (event && event.Records) return 'LAMBDA_EDGE'

  throw new Error('Unable to determine event source based on event.')
}

function proxy ({
  server,
  event = {},
  context = {},
  callback = null,
  resolutionMode = 'CONTEXT_SUCCEED',
  eventSource = getEventSourceBasedOnEvent({ event }),
  eventFns = getEventFnsBasedOnEventSource({ eventSource })
}) {
  return {
    server,
    promise: new Promise((resolve, reject) => {
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

      if (server.listening) {
        forwardRequestToNodeServer({
          server,
          event,
          context,
          resolver,
          eventSource,
          eventFns
        })
      } else {
        startServer({ server })
          .on('listening', () => forwardRequestToNodeServer({
            server,
            event,
            context,
            resolver,
            eventSource,
            eventFns
          }))
      }
    })
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

function configure ({
  app: configureApp,
  binaryMimeTypes: configureBinaryMimeTypes = [],
  resolutionMode: configureResolutionMode = 'CONTEXT_SUCCEED',
  _eventSource
} = {}) {
  function _createServer ({
    app = configureApp,
    binaryMimeTypes = configureBinaryMimeTypes
  } = {}) {
    return createServer({
      app,
      binaryMimeTypes
    })
  }

  const _server = _createServer()

  function _proxy ({
    server = _server,
    resolutionMode = configureResolutionMode,
    event,
    context,
    callback,
    eventSource = _eventSource
  } = {}) {
    return proxy({
      server,
      event,
      context,
      resolutionMode,
      callback,
      eventSource
    })
  }

  const _handler = (event, context, callback) => _proxy({
    event,
    context,
    callback
  })

  return {
    server: _server,
    createServer: _createServer,
    proxy: _proxy,
    handler: _handler
  }
}

exports.configure = configure
exports.getCurrentLambdaInvoke = getCurrentLambdaInvoke

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.getPathWithQueryStringParams = getPathWithQueryStringParams
  exports.mapApiGatewayEventToHttpRequest = mapApiGatewayEventToHttpRequest
  exports.forwardResponseToApiGateway = forwardResponseToApiGateway
  exports.forwardConnectionErrorResponseToApiGateway = forwardConnectionErrorResponseToApiGateway
  exports.forwardLibraryErrorResponseToApiGateway = forwardLibraryErrorResponseToApiGateway
  exports.forwardRequestToNodeServer = forwardRequestToNodeServer
  exports.startServer = startServer
  exports.getSocketPath = getSocketPath
  exports.makeResolver = makeResolver
}

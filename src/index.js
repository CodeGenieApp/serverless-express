'use strict'
const http = require('http')
const url = require('url')
const binarycase = require('binary-case')
const isType = require('type-is')

function getPathWithQueryStringParams (event) {
  return url.format({ pathname: event.path, query: event.queryStringParameters })
}
function getEventBody (event) {
  return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
}

function clone (json) {
  return JSON.parse(JSON.stringify(json))
}

function getContentType (params) {
  // only compare mime type; ignore encoding part
  return params.contentTypeHeader ? params.contentTypeHeader.split(';')[0] : ''
}

function isContentTypeBinaryMimeType (params) {
  return params.binaryMimeTypes.length > 0 && !!isType.is(params.contentType, params.binaryMimeTypes)
}

function mapApiGatewayEventToHttpRequest (event, context, socketPath) {
  const headers = Object.assign({}, event.headers)

  // NOTE: API Gateway is not setting Content-Length header on requests even when they have a body
  if (event.body && !headers['Content-Length']) {
    const body = getEventBody(event)
    headers['Content-Length'] = Buffer.byteLength(body)
  }

  const clonedEventWithoutBody = clone(event)
  delete clonedEventWithoutBody.body

  headers['x-apigateway-event'] = encodeURIComponent(JSON.stringify(clonedEventWithoutBody))
  headers['x-apigateway-context'] = encodeURIComponent(JSON.stringify(context))

  return {
    method: event.httpMethod,
    path: getPathWithQueryStringParams(event),
    headers,
    socketPath
    // protocol: `${headers['X-Forwarded-Proto']}:`,
    // host: headers.Host,
    // hostname: headers.Host, // Alias for host
    // port: headers['X-Forwarded-Port']
  }
}

function forwardResponseToApiGateway (server, response, resolver) {
  const buf = []

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

      // HACK: modifies header casing to get around API Gateway's limitation of not allowing multiple
      // headers with the same name, as discussed on the AWS Forum https://forums.aws.amazon.com/message.jspa?messageID=725953#725953
      Object.keys(headers)
        .forEach(h => {
          if (Array.isArray(headers[h])) {
            if (h.toLowerCase() === 'set-cookie') {
              headers[h].forEach((value, i) => {
                headers[binarycase(h, i + 1)] = value
              })
              delete headers[h]
            } else {
              headers[h] = headers[h].join(',')
            }
          }
        })

      const contentType = getContentType({ contentTypeHeader: headers['content-type'] })
      const isBase64Encoded = isContentTypeBinaryMimeType({ contentType, binaryMimeTypes: server._binaryTypes })
      const body = bodyBuffer.toString(isBase64Encoded ? 'base64' : 'utf8')
      const successResponse = { statusCode, body, headers, isBase64Encoded }

      resolver.succeed({ response: successResponse })
    })
}

function forwardConnectionErrorResponseToApiGateway (error, resolver) {
  console.log('ERROR: @vendia/serverless-express connection error')
  console.error(error)
  const errorResponse = {
    statusCode: 502, // "DNS resolution, TCP level errors, or actual HTTP parse errors" - https://nodejs.org/api/http.html#http_http_request_options_callback
    body: '',
    headers: {}
  }

  resolver.succeed({ response: errorResponse })
}

function forwardLibraryErrorResponseToApiGateway (error, resolver) {
  console.log('ERROR: @vendia/serverless-express error')
  console.error(error)
  const errorResponse = {
    statusCode: 500,
    body: '',
    headers: {}
  }

  resolver.succeed({ response: errorResponse })
}

function forwardRequestToNodeServer (server, event, context, resolver) {
  try {
    const requestOptions = mapApiGatewayEventToHttpRequest(event, context, getSocketPath(server._socketPathSuffix))
    const req = http.request(requestOptions, (response) => forwardResponseToApiGateway(server, response, resolver))
    if (event.body) {
      const body = getEventBody(event)

      req.write(body)
    }

    req.on('error', (error) => forwardConnectionErrorResponseToApiGateway(error, resolver))
      .end()
  } catch (error) {
    forwardLibraryErrorResponseToApiGateway(error, resolver)
    return server
  }
}

function startServer (server) {
  return server.listen(getSocketPath(server._socketPathSuffix))
}

function getSocketPath (socketPathSuffix) {
  /* istanbul ignore if */ /* only running tests on Linux; Window support is for local dev only */
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

function createServer (requestListener, serverListenCallback, binaryTypes) {
  const server = http.createServer(requestListener)

  server._socketPathSuffix = getRandomString()
  server._binaryTypes = binaryTypes ? binaryTypes.slice() : []
  server.on('listening', () => {
    server._isListening = true

    if (serverListenCallback) serverListenCallback()
  })
  server.on('close', () => {
    server._isListening = false
  })
    .on('error', (error) => {
      /* istanbul ignore else */
      if (error.code === 'EADDRINUSE') {
        console.warn(`WARNING: Attempting to listen on socket ${getSocketPath(server._socketPathSuffix)}, but it is already in use. This is likely as a result of a previous invocation error or timeout. Check the logs for the invocation(s) immediately prior to this for root cause, and consider increasing the timeout and/or cpu/memory allocation if this is purely as a result of a timeout. @vendia/serverless-express will restart the Node.js server listening on a new port and continue with this request.`)
        server._socketPathSuffix = getRandomString()
        return server.close(() => startServer(server))
      } else {
        console.log('ERROR: server error')
        console.error(error)
      }
    })

  return server
}

function proxy (server, event, context, resolutionMode, callback) {
  // DEPRECATED: Legacy support
  if (!resolutionMode) {
    const resolver = makeResolver({ context, resolutionMode: 'CONTEXT_SUCCEED' })
    if (server._isListening) {
      forwardRequestToNodeServer(server, event, context, resolver)
      return server
    } else {
      return startServer(server)
        .on('listening', () => proxy(server, event, context))
    }
  }

  return {
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

      if (server._isListening) {
        forwardRequestToNodeServer(server, event, context, resolver)
      } else {
        startServer(server)
          .on('listening', () => forwardRequestToNodeServer(server, event, context, resolver))
      }
    })
  }
}

function makeResolver (params/* {
  context,
  callback,
  promise,
  resolutionMode
} */) {
  return {
    succeed: (params2/* {
      response
    } */) => {
      if (params.resolutionMode === 'CONTEXT_SUCCEED') return params.context.succeed(params2.response)
      if (params.resolutionMode === 'CALLBACK') return params.callback(null, params2.response)
      if (params.resolutionMode === 'PROMISE') return params.promise.resolve(params2.response)
    }
  }
}

exports.createServer = createServer
exports.proxy = proxy

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

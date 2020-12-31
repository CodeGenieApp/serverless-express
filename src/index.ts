import http from 'http'
import url from 'url'
import { binaryCase } from '@src/helpers/binaryCase'
// import IsType from 'type-is'
// const isType: any = IsType

const getPathWithQueryStringParams = (event: any) => {
  return url.format({ pathname: event.path, query: event.queryStringParameters })
}
const getEventBody = (event: any) => {
  return Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
}

const clone = (json: string) => {
  return JSON.parse(JSON.stringify(json))
}

const getContentType = (params: any) => {
  // only compare mime type; ignore encoding part
  return params.contentTypeHeader ? params.contentTypeHeader.split(';')[0] : ''
}

const isContentTypeBinaryMimeType = (params: any) => {
  // return params.binaryMimeTypes.length > 0 && !!isType.is(params.contentType, params.binaryMimeTypes)
  return params.binaryMimeTypes.length > 0
}

const mapApiGatewayEventToHttpRequest = (event: any, context: any, socketPath: any) => {
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

const forwardResponseToApiGateway = (server: any, response: any, resolver: any) => {
  const buf = [] as any[]

  response
    .on('data', (chunk: any) => buf.push(chunk))
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
              headers[h].forEach((value: any, i: number) => {
                const binarCaseResponse = binaryCase(h, i + 1)
                if (typeof binarCaseResponse === 'string') {
                  headers[binarCaseResponse] = value
                }
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

function forwardConnectionErrorResponseToApiGateway (error: any, resolver: any) {
  console.log('ERROR: @vendia/serverless-express connection error')
  console.error(error)
  const errorResponse = {
    statusCode: 502, // "DNS resolution, TCP level errors, or actual HTTP parse errors" - https://nodejs.org/api/http.html#http_http_request_options_callback
    body: '',
    headers: {}
  }

  resolver.succeed({ response: errorResponse })
}

function forwardLibraryErrorResponseToApiGateway (error: any, resolver: any) {
  console.log('ERROR: @vendia/serverless-express error')
  console.error(error)
  const errorResponse = {
    statusCode: 500,
    body: '',
    headers: {}
  }

  resolver.succeed({ response: errorResponse })
}

function forwardRequestToNodeServer (server: any, event: any, context: any, resolver: any) {
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

function startServer (server: any) {
  return server.listen(getSocketPath(server._socketPathSuffix))
}

function getSocketPath (socketPathSuffix: any) {
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

export const createServer = (requestListener: any, serverListenCallback?: any, binaryTypes?: any) => {
  const server: any = http.createServer(requestListener)

  server._socketPathSuffix = getRandomString()
  server._binaryTypes = binaryTypes ? binaryTypes.slice() : []
  server.on('listening', () => {
    server._isListening = true

    if (serverListenCallback) serverListenCallback()
  })
  server.on('close', () => {
    server._isListening = false
  })
    .on('error', (error: any) => {
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

export const proxy = (server: any, event: any, context: any, resolutionMode?: any, callback?: any) => {
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

function makeResolver (params: any/* {
  context,
  callback,
  promise,
  resolutionMode
} */) {
  return {
    succeed: (params2: any/* {
      response
    } */) => {
      if (params.resolutionMode === 'CONTEXT_SUCCEED') return params.context.succeed(params2.response)
      if (params.resolutionMode === 'CALLBACK') return params.callback(null, params2.response)
      if (params.resolutionMode === 'PROMISE') return params.promise.resolve(params2.response)
    }
  }
}

/* istanbul ignore else */
// export const serverlessExpress = process.env.NODE_ENV === 'test' ? {
//   getPathWithQueryStringParams,
//   mapApiGatewayEventToHttpRequest,
//   forwardResponseToApiGateway,
//   forwardConnectionErrorResponseToApiGateway,
//   forwardLibraryErrorResponseToApiGateway,
//   forwardRequestToNodeServer,
//   startServer,
//   getSocketPath,
//   makeResolver,
// } : {}
export const serverlessExpress = {
  getPathWithQueryStringParams,
  mapApiGatewayEventToHttpRequest,
  forwardResponseToApiGateway,
  forwardConnectionErrorResponseToApiGateway,
  forwardLibraryErrorResponseToApiGateway,
  forwardRequestToNodeServer,
  startServer,
  getSocketPath,
  makeResolver,
}

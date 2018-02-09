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
const binarycase = require('binary-case')

function getPathWithQueryStringParams(event) {
  return url.format({ pathname: event.path, query: event.queryStringParameters })
}

function getContentType(params) {
  // only compare mime type; ignore encoding part
  return params.contentTypeHeader ? params.contentTypeHeader.split(';')[0] : ''
}

function isContentTypeBinaryMimeType(params) {
  return params.binaryMimeTypes.indexOf(params.contentType) !== -1
}

function mapApiGatewayEventToHttpRequest(event, context, socketPath) {
    const headers = event.headers || {} // NOTE: Mutating event.headers; prefer deep clone of event.headers
    const eventWithoutBody = Object.assign({}, event)
    delete eventWithoutBody.body

    headers['x-apigateway-event'] = encodeURIComponent(JSON.stringify(eventWithoutBody))
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

function forwardResponseToApiGateway(server, response, context) {
    let buf = []

    response
        .on('data', (chunk) => buf.push(chunk))
        .on('end', () => {
            const bodyBuffer = Buffer.concat(buf)
            const statusCode = response.statusCode
            const headers = response.headers

            // chunked transfer not currently supported by API Gateway
            if (headers['transfer-encoding'] === 'chunked') delete headers['transfer-encoding']

            // HACK: modifies header casing to get around API Gateway's limitation of not allowing multiple
            // headers with the same name, as discussed on the AWS Forum https://forums.aws.amazon.com/message.jspa?messageID=725953#725953
            Object.keys(headers)
                .forEach(h => {
                    if(Array.isArray(headers[h])) {
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
            const successResponse = {statusCode, body, headers, isBase64Encoded}

            context.succeed(successResponse)
        })
}

function forwardConnectionErrorResponseToApiGateway(server, error, context) {
    console.log('ERROR: aws-serverless-express connection error')
    console.error(error)
    const errorResponse = {
        statusCode: 502, // "DNS resolution, TCP level errors, or actual HTTP parse errors" - https://nodejs.org/api/http.html#http_http_request_options_callback
        body: '',
        headers: {}
    }

    context.succeed(errorResponse)
}

function forwardLibraryErrorResponseToApiGateway(server, error, context) {
    console.log('ERROR: aws-serverless-express error')
    console.error(error)
    const errorResponse = {
        statusCode: 500,
        body: '',
        headers: {}
    }

    context.succeed(errorResponse)
}

function forwardRequestToNodeServer(server, event, context) {
    try {
        const requestOptions = mapApiGatewayEventToHttpRequest(event, context, getSocketPath(server._socketPathSuffix))
        const req = http.request(requestOptions, (response, body) => forwardResponseToApiGateway(server, response, context))
        if (event.body) {
            if (event.isBase64Encoded) {
                event.body = new Buffer(event.body, 'base64')
            }

            req.write(event.body)
        }

        req.on('error', (error) => forwardConnectionErrorResponseToApiGateway(server, error, context))
        .end()
    } catch (error) {
       forwardLibraryErrorResponseToApiGateway(server, error, context)
       return server
   }
}

function startServer(server) {
    return server.listen(getSocketPath(server._socketPathSuffix))
}

function getSocketPath(socketPathSuffix) {
  if (/^win/.test(process.platform)) {
    const path = require('path')
    return path.join('\\\\?\\pipe', process.cwd(), `server-${socketPathSuffix}`)
  }
  else {
    return `/tmp/server-${socketPathSuffix}.sock`
  }
}

function getRandomString() {
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
        if (error.code === 'EADDRINUSE') {
            console.warn(`WARNING: Attempting to listen on socket ${getSocketPath(server._socketPathSuffix)}, but it is already in use. This is likely as a result of a previous invocation error or timeout. Check the logs for the invocation(s) immediately prior to this for root cause, and consider increasing the timeout and/or cpu/memory allocation if this is purely as a result of a timeout. aws-serverless-express will restart the Node.js server listening on a new port and continue with this request.`)
            server._socketPathSuffix = getRandomString()
            return server.close(() => startServer(server))
        }

        console.log('ERROR: server error')
        console.error(error)
    })

    return server
}

function proxy(server, event, context) {
    if (server._isListening) {
      forwardRequestToNodeServer(server, event, context)
      return server
    } else {
        return startServer(server)
        .on('listening', () => proxy(server, event, context))
    }
}

exports.createServer = createServer
exports.proxy = proxy

if (process.env.NODE_ENV === 'test') {
    exports.getPathWithQueryStringParams = getPathWithQueryStringParams
    exports.mapApiGatewayEventToHttpRequest = mapApiGatewayEventToHttpRequest
    exports.forwardResponseToApiGateway = forwardResponseToApiGateway
    exports.forwardConnectionErrorResponseToApiGateway = forwardConnectionErrorResponseToApiGateway
    exports.forwardLibraryErrorResponseToApiGateway = forwardLibraryErrorResponseToApiGateway
    exports.forwardRequestToNodeServer = forwardRequestToNodeServer
    exports.startServer = startServer
    exports.getSocketPath = getSocketPath
}

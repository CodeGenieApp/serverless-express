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
const mock = require('mock-http')
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

function mapApiGatewayEventToHttpRequest(event, context) {
    const headers = event.headers || {} // NOTE: Mutating event.headers; prefer deep clone of event.headers
    const eventWithoutBody = Object.assign({}, event)
    delete eventWithoutBody.body

    headers['x-apigateway-event'] = encodeURIComponent(JSON.stringify(eventWithoutBody))
    headers['x-apigateway-context'] = encodeURIComponent(JSON.stringify(context))

    return {
        method: event.httpMethod,
        url: getPathWithQueryStringParams(event),
        headers
        // protocol: `${headers['X-Forwarded-Proto']}:`,
        // host: headers.Host,
        // hostname: headers.Host, // Alias for host
        // port: headers['X-Forwarded-Port']
    }
}

function makeContextResponse(bodyBuffer, response, binaryMimeTypes) {
    const statusCode = response.statusCode
    const headers = response._internal ? response._internal.headers : response.headers

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
    const isBase64Encoded = isContentTypeBinaryMimeType({ contentType, binaryMimeTypes })
    const body = bodyBuffer.toString(isBase64Encoded ? 'base64' : 'utf8')
    return {statusCode, body, headers, isBase64Encoded}
}

function forwardLibraryErrorResponseToApiGateway(error, context) {
    console.log('ERROR: aws-serverless-express error')
    console.error(error)
    const errorResponse = {
        statusCode: 500,
        body: '',
        headers: {}
    }

    context.succeed(errorResponse)
}

function createServer (requestListener, serverListenCallback, binaryTypes) {
    requestListener._binaryTypes = binaryTypes ? binaryTypes.slice() : []

    // To retain backward compatibility, invoke the serverListenCallback
    // to signal that we are ready to receive incoming requests
    if (typeof serverListenCallback === 'function') {
        serverListenCallback()
    }

    return requestListener
}

function forwardResponseToContext (context, binaryTypes) {
    const response = new mock.Response({
        onEnd: () => context.succeed(makeContextResponse(response._internal.buffer, response, binaryTypes))
    })
    return response
}

function proxy(requestListener, event, context, binaryTypes) {
    try {
        const binaryMimeTypes = binaryTypes || requestListener._binaryTypes
        const requestOptions = mapApiGatewayEventToHttpRequest(event, context)
        if (event.body) {
          requestOptions.buffer = new Buffer(event.isBase64Encoded
            ? new Buffer(event.body, 'base64')
            : new Buffer(event.body)
          )
        }
        const request = new mock.Request(requestOptions)
        const response = forwardResponseToContext(context, binaryMimeTypes)
        requestListener(request, response)
        return requestListener
    } catch (error) {
        forwardLibraryErrorResponseToApiGateway(error, context)
        return requestListener
    }
}

exports.createServer = createServer
exports.proxy = proxy

if (process.env.NODE_ENV === 'test') {
    exports.getPathWithQueryStringParams = getPathWithQueryStringParams
    exports.mapApiGatewayEventToHttpRequest = mapApiGatewayEventToHttpRequest
    exports.forwardLibraryErrorResponseToApiGateway = forwardLibraryErrorResponseToApiGateway
    exports.forwardResponseToContext = forwardResponseToContext
    exports.makeContextResponse = makeContextResponse
}

'use-strict'
const { mapEventToHttpRequest } = require('./utils')
const { getEventBody } = require('../utils')

function mapApiGatewayEventToHttpRequest ({ event, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  // NOTE: API Gateway is not setting Content-Length header on requests even when they have a body
  if (event.body && !httpRequest.headers['Content-Length']) {
    const body = getEventBody({ event })
    httpRequest.headers['Content-Length'] = Buffer.byteLength(body)
  }

  return httpRequest
}

function mapResponseToApiGateway ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  // chunked transfer not currently supported by API Gateway
  /* istanbul ignore else */
  if (headers['transfer-encoding'] === 'chunked') {
    delete headers['transfer-encoding']
  }

  return {
    statusCode,
    body,
    multiValueHeaders: headers,
    isBase64Encoded
  }
}

module.exports = {
  mapApiGatewayEventToHttpRequest,
  mapResponseToApiGateway
}

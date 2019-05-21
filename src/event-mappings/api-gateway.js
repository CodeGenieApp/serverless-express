'use-strict'
const { mapEventToHttpRequest } = require('./utils')
const { getEventBody } = require('../utils')

function mapApiGatewayEventToHttpRequest ({
  event,
  socketPath
}) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  if (event.body) {
    const body = getEventBody({ event })
    const isBase64Encoded = event.isBase64Encoded
    httpRequest.headers['Content-Length'] = Buffer.byteLength(body, isBase64Encoded ? 'base64' : 'utf8')
  }

  return httpRequest
}

function mapResponseToApiGateway ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const multiValueHeaders = {}

  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    // chunked transfer not currently supported by API Gateway
    /* istanbul ignore else */
    if (headerKey === 'transfer-encoding' && headerValue === 'chunked') return

    const headerArray = Array.isArray(headerValue) ? headerValue : [headerValue]

    multiValueHeaders[headerKey] = headerArray
  })

  return {
    statusCode,
    body,
    multiValueHeaders,
    isBase64Encoded
  }
}

module.exports = {
  mapApiGatewayEventToHttpRequest,
  mapResponseToApiGateway
}

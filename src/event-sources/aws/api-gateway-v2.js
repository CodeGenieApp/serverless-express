const url = require('url')
const { getResponseToService, getEventBody } = require('../utils')

function getRequestValuesFromApiGatewayEvent ({ event }) {
  const {
    requestContext,
    requestPath,
    rawPath,
    rawQueryString,
    cookies
  } = event
  const method = requestContext.http.method
  const requestPathOrRawPath = requestPath || rawPath
  const basePath = '' // TODO: Test with custom domain
  const stripBasePathRegex = new RegExp(`^${basePath}`)
  const path = url.format({
    pathname: requestPathOrRawPath.replace(stripBasePathRegex, ''),
    search: rawQueryString
  })

  const headers = []

  if (cookies) {
    headers.cookie = cookies.join('; ')
  }

  Object.entries(event.headers).forEach(([headerKey, headerValue]) => {
    headers[headerKey.toLowerCase()] = headerValue
  })

  let body

  if (event.body) {
    body = getEventBody({ event })
    const isBase64Encoded = event.isBase64Encoded
    headers['content-length'] = Buffer.byteLength(body, isBase64Encoded ? 'base64' : 'utf8')
  }

  return {
    method,
    headers,
    body,
    remoteAddress: requestContext.http.sourceIp,
    path
  }
}

function getResponseToApiGateway ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const responseToService = getResponseToService({
    statusCode,
    body,
    headers,
    isBase64Encoded
  })
  const transferEncodingHeader = responseToService.multiValueHeaders['transfer-encoding']

  // chunked transfer not currently supported by API Gateway
  if (transferEncodingHeader && transferEncodingHeader.includes('chunked')) {
    responseToService.multiValueHeaders['transfer-encoding'] = transferEncodingHeader.filter(headerValue => headerValue !== 'chunked')
  }

  return responseToService
}

module.exports = {
  getRequestValues: getRequestValuesFromApiGatewayEvent,
  response: getResponseToApiGateway
}

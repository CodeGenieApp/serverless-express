const url = require('url')
const { getEventBody } = require('../utils')

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
  headers = {},
  isBase64Encoded = false,
  response = {}
}) {
  if (headers['transfer-encoding'] === 'chunked' || response.chunkedEncoding) {
    throw new Error('chunked encoding is not supported by API Gateway')
  }

  const cookies = headers["set-cookie"];
  delete headers["set-cookie"];

  return {
    statusCode,
    body,
    cookies,
    headers,
    isBase64Encoded
  }
}

module.exports = {
  getRequest: getRequestValuesFromApiGatewayEvent,
  getResponse: getResponseToApiGateway
}

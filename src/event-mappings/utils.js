const { getPathWithQueryStringParams } = require('../utils')

function getEventBody ({
  event,
  body = event.body,
  isBase64Encoded = event.isBase64Encoded
}) {
  return Buffer.from(body, isBase64Encoded ? 'base64' : 'utf8')
}

function getRequestValuesFromEvent ({
  event,
  method = event.httpMethod,
  path = getPathWithQueryStringParams({ event }),
  headers
}) {
  if (!headers) {
    headers = {}
    Object.entries(event.multiValueHeaders).forEach(([headerKey, headerValue]) => {
      headers[headerKey] = headerValue.join(',')
    })
  }

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
    remoteAddress: event.requestContext.identity.sourceIp,
    path
  }
}

function getResponseToService ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const multiValueHeaders = {}

  Object.entries(headers).forEach(([headerKey, headerValue]) => {
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

function getEventSourceBasedOnEvent ({
  event
}) {
  if (event && event.requestContext && event.requestContext.elb) return 'ALB'
  if (event && event.requestContext && event.requestContext.stage) return 'API_GATEWAY'
  if (event && event.Records) return 'LAMBDA_EDGE'

  throw new Error('Unable to determine event source based on event.')
}

module.exports = {
  getRequestValuesFromEvent,
  getResponseToService,
  getEventSourceBasedOnEvent
}

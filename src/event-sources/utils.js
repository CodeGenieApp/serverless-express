const url = require('url')

function getPathWithQueryStringParams ({
  event,
  query = event.multiValueQueryStringParameters,
  // NOTE: Use `event.pathParameters.proxy` if available ({proxy+}); fall back to `event.path`
  path = (event.pathParameters && event.pathParameters.proxy && `/${event.pathParameters.proxy}`) || event.path,
  // NOTE: Strip base path for custom domains
  stripBasePath = '',
  replaceRegex = new RegExp(`^${stripBasePath}`)
}) {
  return url.format({
    pathname: path.replace(replaceRegex, ''),
    query
  })
}

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
  path = getPathWithQueryStringParams({ event })
}) {
  let headers = {}
  if (event.multiValueHeaders) {
    Object.entries(event.multiValueHeaders).forEach(([headerKey, headerValue]) => {
      headers[headerKey.toLowerCase()] = headerValue.join(',')
    })
  } else {
    headers = event.headers
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

    multiValueHeaders[headerKey.toLowerCase()] = headerArray
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
  if (event && event.requestContext && event.requestContext.stage) {
    return event.version === '2.0' ? 'API_GATEWAY_V2' : 'API_GATEWAY_V1'
  }
  if (event && event.Records) return 'LAMBDA_EDGE'

  throw new Error('Unable to determine event source based on event.')
}

module.exports = {
  getPathWithQueryStringParams,
  getRequestValuesFromEvent,
  getResponseToService,
  getEventSourceBasedOnEvent,
  getEventBody
}

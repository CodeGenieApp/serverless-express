const url = require('url')

function getPathWithQueryStringParams ({
  event,
  query = event.multiValueQueryStringParameters,
  // NOTE: Always use event.path, if the API gateway has custom route setup, for example if my controllers path is
  // something like employee/services/service1, employee/services/service2 etc, if I dont have any custom path/resources  setup
  // and directly have root/{proxy+} it works as expected, if i have a resource like /employee and child to that if there
  // is a resource like {proxy+} it is not working as expected and errors out with 404. This change is required to address that
  // specific issue.
  path = event.path,
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
    headers = getCommaDelimitedHeaders({ headersMap: event.multiValueHeaders, lowerCaseKey: true })
  } else {
    headers = event.headers
  }

  let body

  if (event.body) {
    body = getEventBody({ event })
    const { isBase64Encoded } = event
    headers['content-length'] = Buffer.byteLength(body, isBase64Encoded ? 'base64' : 'utf8')
  }

  const remoteAddress = (event && event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp) || ''

  return {
    method,
    headers,
    body,
    remoteAddress,
    path
  }
}

function getMultiValueHeaders ({ headers }) {
  const multiValueHeaders = {}

  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    const headerArray = Array.isArray(headerValue) ? headerValue : [headerValue]

    multiValueHeaders[headerKey.toLowerCase()] = headerArray
  })

  return multiValueHeaders
}

function getEventSourceNameBasedOnEvent ({
  event
}) {
  if (event.requestContext && event.requestContext.elb) return 'AWS_ALB'
  if (event.Records) return 'AWS_LAMBDA_EDGE'
  if (event.requestContext) {
    return event.version === '2.0' ? 'AWS_API_GATEWAY_V2' : 'AWS_API_GATEWAY_V1'
  }

  throw new Error('Unable to determine event source based on event.')
}

function getCommaDelimitedHeaders ({ headersMap, separator = ',', lowerCaseKey = false }) {
  const commaDelimitedHeaders = {}

  Object.entries(headersMap)
    .forEach(([headerKey, headerValue]) => {
      const newKey = lowerCaseKey ? headerKey.toLowerCase() : headerKey
      if (Array.isArray(headerValue)) {
        commaDelimitedHeaders[newKey] = headerValue.join(separator)
      } else {
        commaDelimitedHeaders[newKey] = headerValue
      }
    })

  return commaDelimitedHeaders
}

module.exports = {
  getPathWithQueryStringParams,
  getRequestValuesFromEvent,
  getMultiValueHeaders,
  getEventSourceNameBasedOnEvent,
  getEventBody,
  getCommaDelimitedHeaders
}

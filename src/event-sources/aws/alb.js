const url = require('url')
const { getRequestValuesFromEvent, getMultiValueHeaders } = require('../utils')

function getPathWithQueryStringUseUnescapeParams ({
  event,
  // NOTE: Use `event.pathParameters.proxy` if available ({proxy+}); fall back to `event.path`
  path = (event.pathParameters && event.pathParameters.proxy && `/${event.pathParameters.proxy}`) || event.path,
  // NOTE: Strip base path for custom domains
  stripBasePath = '',
  replaceRegex = new RegExp(`^${stripBasePath}`)
}) {
  const query = {}
  // decode everything back into utf-8 text.
  if (event.multiValueQueryStringParameters) {
    for (const key in event.multiValueQueryStringParameters) {
      const formattedKey = decodeURIComponent(key)
      query[formattedKey] = event.multiValueQueryStringParameters[key].map(value => decodeURIComponent(value))
    }
  } else {
    for (const key in event.queryStringParameters) {
      const formattedKey = decodeURIComponent(key)
      query[formattedKey] = decodeURIComponent(event.queryStringParameters[key])
    }
  }

  return url.format({
    pathname: path.replace(replaceRegex, ''),
    query
  })
}

const getRequestValuesFromAlbEvent = ({ event }) => {
  const values = getRequestValuesFromEvent({
    event,
    path: getPathWithQueryStringUseUnescapeParams({ event })
  })
  return values
}

const getResponseToAlb = ({
  event,
  statusCode,
  body,
  headers: responseHeaders,
  isBase64Encoded
}) => {
  const multiValueHeaders = !event.headers ? getMultiValueHeaders({ headers: responseHeaders }) : undefined
  const headers = event.headers
    ? Object.entries(responseHeaders).reduce((acc, [k, v]) => {
      acc[k] = Array.isArray(v) ? v[0] : v
      return acc
    }, {})
    : undefined

  return {
    statusCode,
    body,
    headers,
    multiValueHeaders,
    isBase64Encoded
  }
}

module.exports = {
  getRequest: getRequestValuesFromAlbEvent,
  getResponse: getResponseToAlb
}

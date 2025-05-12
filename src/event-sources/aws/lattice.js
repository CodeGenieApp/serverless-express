const url = require('url');
const { getRequestValuesFromEvent, getMultiValueHeaders } = require('../utils');

function getPathWithQueryStringUseUnescapeParams ({
  event,
  path = event.path,
  // NOTE: Strip base path for custom domains
  stripBasePath = '',
  replaceRegex = new RegExp(`^${stripBasePath}`)
}) {
  const query = {}
  // decode everything back into utf-8 text.
  if (event.multiValueQueryStringParameters) {
    for (const key in event.multiValueQueryStringParameters) {
      const formattedKey = decodeUrlencoded(key)
      query[formattedKey] = event.multiValueQueryStringParameters[key].map(value => decodeUrlencoded(value))
    }
  } else {
    for (const key in event.queryStringParameters) {
      const formattedKey = decodeUrlencoded(key)
      query[formattedKey] = decodeUrlencoded(event.queryStringParameters[key])
    }
  }

  return url.format({
    pathname: path.replace(replaceRegex, ''),
    query
  })
}

// Decode an "application/x-www-form-urlencoded" encoded string.
function decodeUrlencoded (val) {
  return decodeURIComponent(val.replace(/\+/g, '%20'))
}

const getRequestValuesFromLatticeEvent = ({ event }) => {
  const values = getRequestValuesFromEvent({
    event,
    path: getPathWithQueryStringUseUnescapeParams({ event })
  })
  return values
}

const getResponseToLattice = ({
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
  getRequest: getRequestValuesFromLatticeEvent,
  getResponse: getResponseToLattice,
};
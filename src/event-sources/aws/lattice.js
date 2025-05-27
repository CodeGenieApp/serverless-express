const url = require('url')
const { getRequestValuesFromEvent, getCommaDelimitedHeaders } = require('../utils')

function getPathWithQueryStringUseUnescapeParams ({
  event,
  path = event.path,
  // NOTE: Strip base path for custom domains
  stripBasePath = '',
  replaceRegex = new RegExp(`^${stripBasePath}`)
}) {
  const query = {}
  // decode everything back into utf-8 text.
  for (const key in event.queryStringParameters) {
    const formattedKey = decodeUrlencoded(key)
    query[formattedKey] = event.queryStringParameters[key].map(value => decodeUrlencoded(value))
  }

  return url.format({
    pathname: path.replace(replaceRegex, '')
    // query
  })
}

// Decode an "application/x-www-form-urlencoded" encoded string.
function decodeUrlencoded (val) {
  return decodeURIComponent(val.replace(/\+/g, '%20'))
}

const getRequestValuesFromLatticeEvent = ({ event }) => {
  const values = getRequestValuesFromEvent({
    event,
    method: event.method,
    path: getPathWithQueryStringUseUnescapeParams({ event })
  })

  // NOTE: Lattice always sends the headers as array that needs to be converted to a comma delimited string
  values.headers = getCommaDelimitedHeaders({ headersMap: event.headers, lowerCaseKey: true })

  return values
}

const getResponseToLattice = ({
  statusCode,
  body,
  headers: responseHeaders,
  isBase64Encoded
}) => {
  const headers = getCommaDelimitedHeaders({ headersMap: responseHeaders })

  return {
    statusCode,
    body,
    headers,
    isBase64Encoded
  }
}

module.exports = {
  getRequest: getRequestValuesFromLatticeEvent,
  getResponse: getResponseToLattice
}

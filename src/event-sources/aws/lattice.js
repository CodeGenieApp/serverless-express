const { getRequestValuesFromEvent, getCommaDelimitedHeaders } = require('../utils')

const getRequestValuesFromLatticeEvent = ({ event }) => {
  const values = getRequestValuesFromEvent({
    event,
    method: event.method,
    path: event.path // query parameters are already included in the path
  })

  // Lattice always sends the headers as array that needs to be converted to a comma delimited string
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

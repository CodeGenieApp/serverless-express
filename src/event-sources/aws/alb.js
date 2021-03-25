const { getRequestValuesFromEvent, getMultiValueHeaders } = require('../utils')

const getRequestValuesFromAlbEvent = ({ event }) => getRequestValuesFromEvent({ event })
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

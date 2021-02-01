const { getRequestValuesFromEvent, getMultiValueHeaders } = require('../utils')

const getRequestValuesFromAlbEvent = ({ event }) => getRequestValuesFromEvent({ event })
const getResponseToAlb = ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) => {
  const multiValueHeaders = getMultiValueHeaders({ headers })

  return {
    statusCode,
    body,
    multiValueHeaders,
    isBase64Encoded
  }
}

module.exports = {
  getRequest: getRequestValuesFromAlbEvent,
  getResponse: getResponseToAlb
}

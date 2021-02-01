const { getRequestValuesFromEvent, getMultiValueHeaders } = require('../utils')

const getRequestValuesFromApiGatewayEvent = ({ event }) => getRequestValuesFromEvent({ event })

function getResponseToApiGateway ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const multiValueHeaders = getMultiValueHeaders({ headers })
  const transferEncodingHeader = multiValueHeaders['transfer-encoding']

  // chunked transfer not currently supported by API Gateway
  if (transferEncodingHeader && transferEncodingHeader.includes('chunked')) {
    multiValueHeaders['transfer-encoding'] = transferEncodingHeader.filter(headerValue => headerValue !== 'chunked')
  }

  return {
    statusCode,
    body,
    multiValueHeaders,
    isBase64Encoded
  }
}

module.exports = {
  getRequest: getRequestValuesFromApiGatewayEvent,
  getResponse: getResponseToApiGateway
}

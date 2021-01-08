const { getRequestValuesFromEvent, getResponseToService } = require('../utils')

const getRequestValuesFromApiGatewayEvent = ({ event }) => getRequestValuesFromEvent({ event })

function getResponseToApiGateway ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const responseToService = getResponseToService({
    statusCode,
    body,
    headers,
    isBase64Encoded
  })
  const transferEncodingHeader = responseToService.multiValueHeaders['transfer-encoding']

  // chunked transfer not currently supported by API Gateway
  if (transferEncodingHeader && transferEncodingHeader.includes('chunked')) {
    responseToService.multiValueHeaders['transfer-encoding'] = transferEncodingHeader.filter(headerValue => headerValue !== 'chunked')
  }

  return responseToService
}

module.exports = {
  getRequestValues: getRequestValuesFromApiGatewayEvent,
  response: getResponseToApiGateway
}

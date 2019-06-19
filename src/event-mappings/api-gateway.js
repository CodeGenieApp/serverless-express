const { mapEventToHttpRequest, mapResponseToService } = require('./utils')

const mapApiGatewayEventToHttpRequest = ({ event }) => mapEventToHttpRequest({ event })

function mapResponseToApiGateway ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const responseToService = mapResponseToService({
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
  mapApiGatewayEventToHttpRequest,
  mapResponseToApiGateway
}

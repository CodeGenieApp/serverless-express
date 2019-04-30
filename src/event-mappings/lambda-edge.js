const { mapEventToHttpRequest } = require('./utils')

function mapLambdaEdgeEventToHttpRequest ({ event, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  return httpRequest
}

function mapResponseToLambdaEdge ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  return {
    statusCode,
    body,
    multiValueHeaders: headers,
    isBase64Encoded
  }
}

module.exports = {
  mapLambdaEdgeEventToHttpRequest,
  mapResponseToLambdaEdge
}

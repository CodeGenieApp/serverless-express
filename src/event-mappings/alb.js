const { mapEventToHttpRequest } = require('./utils')

function mapAlbEventToHttpRequest ({ event, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  return httpRequest
}

function mapResponseToAlb ({
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
  mapAlbEventToHttpRequest,
  mapResponseToAlb
}

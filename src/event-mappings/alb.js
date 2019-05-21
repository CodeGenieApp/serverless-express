const { mapEventToHttpRequest } = require('./utils')
const { getEventBody } = require('../utils')

function mapAlbEventToHttpRequest ({ event, socketPath }) {
  const httpRequest = mapEventToHttpRequest({ event, socketPath })

  if (event.body) {
    const body = getEventBody({ event })
    const isBase64Encoded = event.isBase64Encoded
    httpRequest.headers['Content-Length'] = Buffer.byteLength(body, isBase64Encoded ? 'base64' : 'utf8')
  }

  return httpRequest
}

function mapResponseToAlb ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const multiValueHeaders = {}

  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    const headerArray = Array.isArray(headerValue) ? headerValue : [headerValue]

    multiValueHeaders[headerKey] = headerArray
  })

  return {
    statusCode,
    body,
    multiValueHeaders,
    isBase64Encoded
  }
}

module.exports = {
  mapAlbEventToHttpRequest,
  mapResponseToAlb
}

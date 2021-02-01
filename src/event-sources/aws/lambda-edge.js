const { getEventBody } = require('../utils')

// Lambda@Edge fails if certain headers are returned
const RESPONSE_HEADERS_DENY_LIST = ['content-length']

function getRequestValuesFromLambdaEdgeEvent ({ event }) {
  const cloudFormationRequest = event.Records[0].cf.request
  const {
    headers: headersMap,
    uri: path,
    method,
    body: requestBodyObject = {},
    clientIp
  } = cloudFormationRequest
  let body = null

  const headers = {}

  Object.entries(headersMap).forEach(([headerKey, headerValue]) => {
    headers[headerKey] = headerValue.map(header => header.value).join(',')
  })

  if (requestBodyObject.data) {
    const isBase64Encoded = requestBodyObject.encoding === 'base64'
    body = getEventBody({
      body: requestBodyObject.data,
      isBase64Encoded
    })
    headers['content-length'] = Buffer.byteLength(body, isBase64Encoded ? 'base64' : 'utf8')
  }

  // TODO: include querystring params in path
  const { host } = headers
  return {
    method,
    path,
    headers,
    body,
    remoteAddress: clientIp,
    host,
    hostname: host // Alias for host
    // protocol: `${headers['X-Forwarded-Proto']}:`,
    // port: headers['X-Forwarded-Port']
  }
}
function getResponseToLambdaEdge ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  const headersMap = {}
  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    const headerKeyLowerCase = headerKey.toLowerCase()
    if (RESPONSE_HEADERS_DENY_LIST.includes(headerKeyLowerCase)) return
    if (!headersMap[headerKeyLowerCase]) headersMap[headerKeyLowerCase] = []

    if (!Array.isArray(headerValue)) {
      headersMap[headerKeyLowerCase].push({
        key: headerKeyLowerCase,
        value: headerValue
      })
      return
    }

    const headersArray = headerValue.map(v => ({
      key: headerKeyLowerCase,
      value: v
    }))
    headersMap[headerKeyLowerCase].push(...headersArray)
  })
  const bodyEncoding = isBase64Encoded ? 'base64' : 'text'
  const responseToService = {
    status: statusCode,
    body,
    headers: headersMap,
    bodyEncoding
  }

  // TODO: Handle if responseToServiceBytes exceeds Lambda@Edge limits
  // const responseToServiceBytes = (new TextEncoder().encode(JSON.stringify(responseToService))).length

  return responseToService
}

module.exports = {
  getRequest: getRequestValuesFromLambdaEdgeEvent,
  getResponse: getResponseToLambdaEdge
}

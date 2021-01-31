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
  if (requestBodyObject.data) {
    if (requestBodyObject.encoding === 'base64') {
      body = Buffer.from(requestBodyObject.data, 'base64').toString('utf8')
    } else {
      body = requestBodyObject.data
    }
  }

  const headers = {}
  Object.entries(headersMap).forEach(([headerKey, headerValue]) => {
    headers[headerKey] = headerValue.map(header => header.value).join(',')
  })
  // const request = getRequestValuesFromEvent({ event })
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

    headersMap[headerKeyLowerCase].push({
      key: headerKeyLowerCase,
      value: headerValue
    })
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

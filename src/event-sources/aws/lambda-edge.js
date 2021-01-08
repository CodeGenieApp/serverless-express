const getRequestValuesFromLambdaEdgeEvent = ({ event }) => {
  const cloudFormationRequest = event.Records[0].cf.request
  const { headers: headersMap, uri: path, method } = cloudFormationRequest

  const headers = {}
  Object.entries(headersMap).forEach(([headerKey, headerValue]) => {
    headers[headerKey] = headerValue.map(header => header.value).join(',')
  })
  // const request = getRequestValuesFromEvent({ event })
  // TODO: include querystring params in path
  return {
    method,
    path,
    headers,
    body: null
    // remoteAddress: event.requestContext.identity.sourceIp,
    // protocol: `${headers['X-Forwarded-Proto']}:`,
    // host: headers.Host,
    // hostname: headers.Host, // Alias for host
    // port: headers['X-Forwarded-Port']
  }
}
const getResponseToLambdaEdge = ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) => {
  const headersMap = {}
  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    // Lambda@Edge fails if you include content-length
    if (headerKey.toLowerCase() === 'content-length') return
    if (!headersMap[headerKey]) headersMap[headerKey] = []

    headersMap[headerKey].push({
      key: headerKey,
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
  getRequestValues: getRequestValuesFromLambdaEdgeEvent,
  response: getResponseToLambdaEdge
}

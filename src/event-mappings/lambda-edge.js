const getRequestValuesFromLambdaEdgeEvent = ({ event }) => {
  const cloudFormationRequest = event.Records[0].cf.request
  const { headers: headersMap, uri: path, method } = cloudFormationRequest

  const headers = {}
  Object.entries(headersMap).forEach(([headerKey, headerValue]) => {
    headers[headerKey] = headerValue.map(header => header.value).join(',')
  })
  // const request = getRequestValuesFromEvent({ event })
  // TODO: include querstring params in path
  return {
    method,
    path,
    headers,
    body: null
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
    if (!headersMap[headerKey]) headersMap[headerKey] = []

    headersMap[headerKey].push({
      key: headerKey,
      value: headerValue
    })
  })

  return {
    status: statusCode,
    body,
    headers: headersMap,
    bodyEncoding: isBase64Encoded ? 'base64' : 'text'
  }
}
module.exports = {
  request: getRequestValuesFromLambdaEdgeEvent,
  response: getResponseToLambdaEdge
}

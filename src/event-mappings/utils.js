const { getPathWithQueryStringParams } = require('../utils')

function mapEventToHttpRequest ({
  event,
  method = event.httpMethod,
  path = getPathWithQueryStringParams({ event }),
  socketPath,
  headers = {
    ...event.multiValueHeaders
  }
}) {
  return {
    method,
    path,
    headers,
    socketPath
    // protocol: `${headers['X-Forwarded-Proto']}:`,
    // host: headers.Host,
    // hostname: headers.Host, // Alias for host
    // port: headers['X-Forwarded-Port']
  }
}

function getEventSourceBasedOnEvent ({
  event
}) {
  if (event && event.requestContext && event.requestContext.elb) return 'ALB'
  if (event && event.requestContext && event.requestContext.stage) return 'API_GATEWAY'
  if (event && event.Records) return 'LAMBDA_EDGE'

  throw new Error('Unable to determine event source based on event.')
}

module.exports = {
  mapEventToHttpRequest,
  getEventSourceBasedOnEvent
}

const apiGatewayEventMapping = require('./api-gateway')
const albEventMapping = require('./alb')
const lambdaEdgeEventMapping = require('./lambda-edge')

function getEventFnsBasedOnEventSource ({ eventSource }) {
  switch (eventSource) {
    case 'API_GATEWAY':
      return apiGatewayEventMapping
    case 'ALB':
      return albEventMapping
    case 'LAMBDA_EDGE':
      return lambdaEdgeEventMapping
    default:
      throw new Error('Couldn\'t detect valid event source.')
  }
}

module.exports = {
  getEventFnsBasedOnEventSource
}

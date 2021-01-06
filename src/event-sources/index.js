const apiGatewayEventSource = require('./api-gateway')
const albEventSource = require('./alb')
const lambdaEdgeEventSource = require('./lambda-edge')

function getEventFnsBasedOnEventSource ({ eventSource }) {
  switch (eventSource) {
    case 'API_GATEWAY':
      return apiGatewayEventSource
    case 'ALB':
      return albEventSource
    case 'LAMBDA_EDGE':
      return lambdaEdgeEventSource
    default:
      throw new Error('Couldn\'t detect valid event source.')
  }
}

module.exports = {
  getEventFnsBasedOnEventSource
}

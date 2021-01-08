const apiGatewayV1EventSource = require('./aws/api-gateway-v1')
const apiGatewayV2EventSource = require('./aws/api-gateway-v2')
const albEventSource = require('./aws/alb')
const lambdaEdgeEventSource = require('./aws/lambda-edge')

function getEventFnsBasedOnEventSource ({ eventSource }) {
  switch (eventSource) {
    case 'API_GATEWAY_V1':
      return apiGatewayV1EventSource
    case 'API_GATEWAY_V2':
      return apiGatewayV2EventSource
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

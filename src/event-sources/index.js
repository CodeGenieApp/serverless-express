const awsApiGatewayV1EventSource = require('./aws/api-gateway-v1')
const awsApiGatewayV2EventSource = require('./aws/api-gateway-v2')
const awsAlbEventSource = require('./aws/alb')
const awsLambdaEdgeEventSource = require('./aws/lambda-edge')

function getEventSource ({ eventSourceName }) {
  switch (eventSourceName) {
    case 'AWS_API_GATEWAY_V1':
      return awsApiGatewayV1EventSource
    case 'AWS_API_GATEWAY_V2':
      return awsApiGatewayV2EventSource
    case 'AWS_ALB':
      return awsAlbEventSource
    case 'AWS_LAMBDA_EDGE':
      return awsLambdaEdgeEventSource
    default:
      throw new Error('Couldn\'t detect valid event source.')
  }
}

module.exports = {
  getEventSource
}

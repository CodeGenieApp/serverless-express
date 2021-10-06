const awsApiGatewayV1EventSource = require('./aws/api-gateway-v1')
const awsApiGatewayV2EventSource = require('./aws/api-gateway-v2')
const awsAlbEventSource = require('./aws/alb')
const awsLambdaEdgeEventSource = require('./aws/lambda-edge')
const awsSnsEventSource = require('./aws/sns')
const awsDynamoDbEventSource = require('./aws/dynamodb')

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
    case 'AWS_DYNAMODB':
      return awsDynamoDbEventSource
    case 'AWS_SNS':
      return awsSnsEventSource
    default:
      throw new Error('Couldn\'t detect valid event source.')
  }
}

module.exports = {
  getEventSource
}

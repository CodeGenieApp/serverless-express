const awsApiGatewayV1EventSource = require('./aws/api-gateway-v1')
const awsApiGatewayV2EventSource = require('./aws/api-gateway-v2')
const awsAlbEventSource = require('./aws/alb')
const awsLambdaEdgeEventSource = require('./aws/lambda-edge')
const awsSnsEventSource = require('./aws/sns')
const awsSqsEventSource = require('./aws/sqs')
const awsDynamoDbEventSource = require('./aws/dynamodb')
const azureHttpFunctionV3EventSource = require('./azure/http-function-runtime-v3')
const awsEventBridgeEventSource = require('./aws/eventbridge')

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
    case 'AZURE_HTTP_FUNCTION_V3':
      return azureHttpFunctionV3EventSource
    case 'AWS_SQS':
      return awsSqsEventSource
    case 'AWS_EVENTBRIDGE':
      return awsEventBridgeEventSource
    default:
      throw new Error('Couldn\'t detect valid event source.')
  }
}

module.exports = {
  getEventSource
}

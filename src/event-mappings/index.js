const { mapApiGatewayEventToHttpRequest, mapResponseToApiGateway } = require('./api-gateway')
const { mapAlbEventToHttpRequest, mapResponseToAlb } = require('./alb')
const { mapLambdaEdgeEventToHttpRequest, mapResponseToLambdaEdge } = require('./lambda-edge')
const { mapEventToHttpRequest, mapResponseToService } = require('./utils')

function getEventFnsBasedOnEventSource ({ eventSource }) {
  switch (eventSource) {
    case 'API_GATEWAY':
      return {
        request: mapApiGatewayEventToHttpRequest,
        response: mapResponseToApiGateway
      }
    case 'ALB':
      return {
        request: mapAlbEventToHttpRequest,
        response: mapResponseToAlb
      }
    case 'LAMBDA_EDGE':
      return {
        request: mapLambdaEdgeEventToHttpRequest,
        response: mapResponseToLambdaEdge
      }
    default:
      return {
        request: mapEventToHttpRequest,
        response: mapResponseToService
      }
  }
}

module.exports = {
  mapApiGatewayEventToHttpRequest,
  mapResponseToApiGateway,
  getEventFnsBasedOnEventSource
}

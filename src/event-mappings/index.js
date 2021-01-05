const apiGatewayEventMapping = require('./api-gateway')
const albEventMapping = require('./alb')
const lambdaEdgeEventMapping = require('./lambda-edge')
const { getRequestValuesFromEvent, getResponseToService } = require('./utils')

function getEventFnsBasedOnEventSource ({ eventSource }) {
  switch (eventSource) {
    case 'API_GATEWAY':
      return apiGatewayEventMapping
    case 'ALB':
      return albEventMapping
    case 'LAMBDA_EDGE':
      return lambdaEdgeEventMapping
    default:
      return {
        request: getRequestValuesFromEvent,
        response: getResponseToService
      }
  }
}

module.exports = {
  getEventFnsBasedOnEventSource
}

const { makeApiGatewayV1Event, makeApiGatewayV1Response } = require('./api-gateway-v1-event')
const { makeApiGatewayV2Event, makeApiGatewayV2Response } = require('./api-gateway-v2-event')
const { makeAlbEvent, makeAlbResponse } = require('./alb-event')
const { makeLambdaEdgeEvent, makeLambdaEdgeResponse } = require('./lambda-edge-event.js')
const { makeAzureHttpFunctionV3Event, makeAzureHttpFunctionV3Response } = require('./azure-http-function-v3-event')

const EVENT_SOURCE_NAMES = [
  'alb',
  'apiGatewayV1',
  'apiGatewayV2',
  'lambdaEdge',
  'azureHttpFunctionV3'
]

const FRAMEWORK_NAMES = [
  'express'
  // 'koa'
]
const EACH_MATRIX = []

EVENT_SOURCE_NAMES.forEach(eventSource => {
  FRAMEWORK_NAMES.forEach(framework => {
    EACH_MATRIX.push([eventSource, framework])
  })
})

const log = {
  info: () => null,
  debug: () => null,
  error: () => null
}

class MockContext {
  constructor (resolve, reject) {
    this.resolve = resolve
    this.reject = reject
  }

  succeed (successResponse) {
    this.resolve(successResponse)
  }

  fail (error) {
    this.reject(error)
  }
}

function makeEvent ({ eventSourceName, ...rest }) {
  switch (eventSourceName) {
    case 'alb':
      return makeAlbEvent(rest)
    case 'apiGatewayV1':
      return makeApiGatewayV1Event(rest)
    case 'apiGatewayV2':
      return makeApiGatewayV2Event(rest)
    case 'lambdaEdge':
      return makeLambdaEdgeEvent(rest)
    case 'azureHttpFunctionV3':
      return makeAzureHttpFunctionV3Event(rest)
    default:
      throw new Error(`Unknown eventSourceName ${eventSourceName}`)
  }
}

function makeResponse ({ eventSourceName, ...rest }, { shouldConvertContentLengthToInt = false } = {}) {
  switch (eventSourceName) {
    case 'alb':
      return makeAlbResponse(rest)
    case 'apiGatewayV1':
      return makeApiGatewayV1Response(rest)
    case 'apiGatewayV2':
      return makeApiGatewayV2Response(rest, { shouldConvertContentLengthToInt })
    case 'lambdaEdge':
      return makeLambdaEdgeResponse(rest)
    case 'azureHttpFunctionV3':
      return makeAzureHttpFunctionV3Response(rest, { shouldConvertContentLengthToInt })
    default:
      throw new Error(`Unknown eventSourceName ${eventSourceName}`)
  }
}

module.exports = {
  log,
  MockContext,
  makeEvent,
  makeResponse,
  makeApiGatewayV2Event,
  EACH_MATRIX
}

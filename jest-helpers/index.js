const { makeApiGatewayV1Event, makeApiGatewayV1Response } = require('./api-gateway-v1-event')
const { makeApiGatewayV2Event, makeApiGatewayV2Response } = require('./api-gateway-v2-event')
const { makeAlbEvent, makeAlbResponse } = require('./alb-event')
const { makeLambdaEdgeEvent, makeLambdaEdgeResponse } = require('./lambda-edge-event.js')
const { makeAzureHttpFunctionV3Event, makeAzureHttpFunctionV3Response } = require('./azure-http-function-v3-event')
const { makeAzureHttpFunctionV4Event, makeAzureHttpFunctionV4Response } = require('./azure-http-function-v4-event')

const EVENT_SOURCE_NAMES = [
  'AWS_ALB',
  'AWS_API_GATEWAY_V1',
  'AWS_API_GATEWAY_V2',
  'AWS_LAMBDA_EDGE',
  'AZURE_HTTP_FUNCTION_V3',
  'AZURE_HTTP_FUNCTION_V4'
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
    case 'AWS_ALB':
      return makeAlbEvent(rest)
    case 'AWS_API_GATEWAY_V1':
      return makeApiGatewayV1Event(rest)
    case 'AWS_API_GATEWAY_V2':
      return makeApiGatewayV2Event(rest)
    case 'AWS_LAMBDA_EDGE':
      return makeLambdaEdgeEvent(rest)
    case 'AZURE_HTTP_FUNCTION_V3':
      return makeAzureHttpFunctionV3Event(rest)
    case 'AZURE_HTTP_FUNCTION_V4':
      return makeAzureHttpFunctionV4Event(rest)
    default:
      throw new Error(`Unknown eventSourceName ${eventSourceName}`)
  }
}

function makeResponse ({ eventSourceName, ...rest }, { shouldConvertContentLengthToInt = false } = {}) {
  switch (eventSourceName) {
    case 'AWS_ALB':
      return makeAlbResponse(rest)
    case 'AWS_API_GATEWAY_V1':
      return makeApiGatewayV1Response(rest)
    case 'AWS_API_GATEWAY_V2':
      return makeApiGatewayV2Response(rest, { shouldConvertContentLengthToInt })
    case 'AWS_LAMBDA_EDGE':
      return makeLambdaEdgeResponse(rest)
    case 'AZURE_HTTP_FUNCTION_V3':
      return makeAzureHttpFunctionV3Response(rest, { shouldConvertContentLengthToInt })
    case 'AZURE_HTTP_FUNCTION_V4':
      return makeAzureHttpFunctionV4Response(rest, { shouldConvertContentLengthToInt })
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

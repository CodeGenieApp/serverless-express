const makeApiGatewayV1Event = require('./api-gateway-v1-event')
const makeApiGatewayV2Event = require('./api-gateway-v2-event')
const makeAlbEvent = require('./alb-event')
const makeLambdaEdgeEvent = require('./lambda-edge-event.js')

const EVENT_SOURCE_NAMES = [
  // 'alb',
  'apiGatewayV1'
  // 'apiGatewayV2',
  // 'lambdaEdge'
]

const FRAMEWORK_NAMES = [
  'express'
]
const EACH_MATRIX = []

EVENT_SOURCE_NAMES.forEach(eventSource => {
  FRAMEWORK_NAMES.forEach(framework => {
    EACH_MATRIX.push([ eventSource, framework ])
  })
})

const log = {
  info: () => null,
  debug: () => null,
  error: () => null
}

class MockContext {
  constructor (resolve) {
    this.resolve = resolve
  }

  succeed (successResponse) {
    this.resolve(successResponse)
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
    default:
      throw new Error(`Unknown eventSourceName ${eventSourceName}`)
  }
}

function expectedRootResponse () {
  return makeResponse({
    multiValueHeaders: {
      'content-length': ['4659'],
      'content-type': ['text/html; charset=utf-8'],
      etag: ['W/"1233-UcgIN3SD7YNLl2bLEKDbkMGu6io"']
    }
  })
}

function makeResponse (response) {
  const baseResponse = {
    body: '',
    isBase64Encoded: false,
    statusCode: 200
  }
  const baseHeaders = {
    'access-control-allow-origin': ['*'],
    'content-type': ['application/json; charset=utf-8'],
    'x-powered-by': ['Express']
  }
  const multiValueHeaders = {
    ...baseHeaders,
    ...response.multiValueHeaders
  }
  const finalResponse = {
    ...baseResponse,
    ...response
  }
  finalResponse.multiValueHeaders = multiValueHeaders
  return finalResponse
}

module.exports = {
  log,
  MockContext,
  makeEvent,
  expectedRootResponse,
  makeResponse,
  makeApiGatewayV2Event,
  EACH_MATRIX
}

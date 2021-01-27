const apiGatewayV1Event = require('./examples/basic-starter-api-gateway-v1/api-gateway-event.json')
const apiGatewayV2Event = require('./examples/basic-starter-api-gateway-v2/api-gateway-event.json')

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

function clone (json) {
  return JSON.parse(JSON.stringify(json))
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep (target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

function makeEvent (eventOverrides = {}) {
  const baseEvent = clone(apiGatewayV1Event)
  const multiValueHeaders = {
    ...baseEvent.multiValueHeaders,
    ...eventOverrides.multiValueHeaders
  }
  const root = {
    ...baseEvent,
    ...eventOverrides
  }
  root.multiValueHeaders = multiValueHeaders
  root.pathParameters.proxy = eventOverrides.path && eventOverrides.path.replace(/^\//, '')
  return root
}

function makeApiGatewayV2Event (values) {
  const baseEvent = clone(apiGatewayV2Event)

  if (!values && !values.requestContext && !values.requestContext.http && !values.requestContext.http.path) {
    values.requestContext.http.path = values.rawPath
  }

  return mergeDeep(baseEvent, values)
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
  clone,
  makeEvent,
  expectedRootResponse,
  makeResponse,
  makeApiGatewayV2Event
}

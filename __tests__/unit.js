const path = require('path')
const awsServerlessExpressTransport = require('../src/transport')
const awsServerlessExpressUtils = require('../src/utils')
const awsServerlessExpressEventMappings = require('../src/event-mappings')
const logger = {
  debug: () => null,
  error: () => null
}

test('getPathWithQueryStringParams: no params', () => {
  const event = {
    path: '/foo/bar'
  }
  const pathWithQueryStringParams = awsServerlessExpressUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar')
})

test('getPathWithQueryStringParams: 1 param', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      'bizz': 'bazz'
    }
  }
  const pathWithQueryStringParams = awsServerlessExpressUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz')
})

test('getPathWithQueryStringParams: to be url-encoded param', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      'redirect_uri': 'http://lvh.me:3000/cb'
    }
  }
  const pathWithQueryStringParams = awsServerlessExpressUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?redirect_uri=http%3A%2F%2Flvh.me%3A3000%2Fcb')
})

test('getPathWithQueryStringParams: 2 params', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      'bizz': 'bazz',
      'buzz': 'bozz'
    }
  }
  const pathWithQueryStringParams = awsServerlessExpressUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz&buzz=bozz')
})

test('getPathWithQueryStringParams: array param', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      'bizz': [
        'bazz',
        'buzz'
      ]
    }
  }
  const pathWithQueryStringParams = awsServerlessExpressUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz&bizz=buzz')
})

function mapAlbEventToHttpRequest (multiValueHeaders = {}) {
  const event = {
    path: '/foo',
    httpMethod: 'GET',
    body: 'Hello serverless!',
    multiValueHeaders
  }
  const eventClone = JSON.parse(JSON.stringify(event))
  delete eventClone.body
  const context = {
    'foo': 'bar'
  }
  const httpRequest = awsServerlessExpressEventMappings.mapAlbEventToHttpRequest({ event, context })

  return {httpRequest, eventClone, context}
}

test('mapAlbEventToHttpRequest: with headers', () => {
  const r = mapAlbEventToHttpRequest({'x-foo': ['foo']})
  expect(r.httpRequest.body).toBeInstanceOf(Buffer)
  delete r.httpRequest.body
  expect(r.httpRequest).toEqual({
    method: 'GET',
    path: '/foo',
    headers: {
      'x-foo': 'foo',
      'Content-Length': Buffer.byteLength('Hello serverless!')
    }
  })
})

test('mapAlbEventToHttpRequest: without headers', () => {
  const r = mapAlbEventToHttpRequest()
  expect(r.httpRequest.body).toBeInstanceOf(Buffer)
  delete r.httpRequest.body
  expect(r.httpRequest).toEqual({
    method: 'GET',
    path: '/foo',
    headers: {
      'Content-Length': Buffer.byteLength('Hello serverless!')
    }
  })
})

function mapApiGatewayEventToHttpRequest (multiValueHeaders = {}) {
  const event = {
    path: '/foo',
    httpMethod: 'GET',
    body: 'Hello serverless!',
    multiValueHeaders
  }
  const eventClone = JSON.parse(JSON.stringify(event))
  delete eventClone.body
  const context = {
    'foo': 'bar'
  }
  const httpRequest = awsServerlessExpressEventMappings.mapApiGatewayEventToHttpRequest({ event, context })

  return {httpRequest, eventClone, context}
}

test('mapApiGatewayEventToHttpRequest: with headers', () => {
  const r = mapApiGatewayEventToHttpRequest({'x-foo': ['foo']})
  expect(r.httpRequest.body).toBeInstanceOf(Buffer)
  delete r.httpRequest.body
  expect(r.httpRequest).toEqual({
    method: 'GET',
    path: '/foo',
    headers: {
      'x-foo': 'foo',
      'Content-Length': Buffer.byteLength('Hello serverless!')
    }
  })
})

test('mapApiGatewayEventToHttpRequest: without headers', () => {
  const r = mapApiGatewayEventToHttpRequest()
  expect(r.httpRequest.body).toBeInstanceOf(Buffer)
  delete r.httpRequest.body
  expect(r.httpRequest).toEqual({
    method: 'GET',
    path: '/foo',
    headers: {
      'Content-Length': Buffer.byteLength('Hello serverless!')
    }
  })
})

test('getSocketPath', () => {
  const socketPath = awsServerlessExpressTransport.getSocketPath({ socketPathSuffix: '12345abcdef' })
  const isWin = process.platform === 'win32'
  const expectedSocketPath = isWin ? path.join('\\\\?\\\\pipe\\\\', process.cwd(), 'server-12345abcdef') : '/tmp/server-12345abcdef.sock'
  expect(socketPath).toBe(expectedSocketPath)
})

const PassThrough = require('stream').PassThrough

class MockResponse extends PassThrough {
  constructor (statusCode, multiValueHeaders = {}, body) {
    super()
    const headers = {}
    Object.entries(multiValueHeaders).forEach(([headerKey, headerValue]) => {
      headers[headerKey] = headerValue.join(',')
    })
    this.statusCode = statusCode
    this.headers = headers
    this.write(body)
    this.end()
  }
}

class MockServer {
  constructor (binaryMimeTypes = []) {
    this._awsServerlessExpress = {
      binaryMimeTypes
    }
  }
}

class MockContext {
  constructor (resolve) {
    this.resolve = resolve
  }
  succeed (successResponse) {
    this.resolve(successResponse)
  }
}

describe('forwardConnectionErrorResponseToApiGateway', () => {
  test('responds with 502 status', () => {
    return new Promise(
      (resolve) => {
        const context = new MockContext(resolve)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response)
        }
        awsServerlessExpressTransport.forwardConnectionErrorResponseToApiGateway({
          error: new Error('ERROR'),
          resolver: contextResolver,
          logger,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 502,
      body: '',
      multiValueHeaders: {},
      isBase64Encoded: false
    }))
  })
  test('responds with 502 status and stack trace', () => {
    return new Promise(
      (resolve) => {
        const context = new MockContext(resolve)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response)
        }
        awsServerlessExpressTransport.forwardConnectionErrorResponseToApiGateway({
          error: new Error('There was a connection error...'),
          resolver: contextResolver,
          logger,
          respondWithErrors: true,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway
        })
      }
    ).then(successResponse => {
      expect(successResponse).toEqual({
        statusCode: 502,
        body: successResponse.body,
        multiValueHeaders: {},
        isBase64Encoded: false
      })
      expect(successResponse.body).toContain('Error: There was a connection error...\n    at ')
    })
  })
})

describe('forwardLibraryErrorResponseToApiGateway', () => {
  test('responds with 500 status', () => {
    return new Promise(
      (resolve) => {
        const context = new MockContext(resolve)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response)
        }
        awsServerlessExpressTransport.forwardLibraryErrorResponseToApiGateway({
          error: new Error('ERROR'),
          resolver: contextResolver,
          logger,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 500,
      body: '',
      multiValueHeaders: {},
      isBase64Encoded: false
    }))
  })
  test('responds with 500 status and stack trace', () => {
    return new Promise(
      (resolve) => {
        const context = new MockContext(resolve)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response)
        }
        awsServerlessExpressTransport.forwardLibraryErrorResponseToApiGateway({
          error: new Error('There was an error...'),
          resolver: contextResolver,
          logger,
          respondWithErrors: true,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway
        })
      }
    ).then(successResponse => {
      expect(successResponse).toEqual({
        statusCode: 500,
        body: successResponse.body,
        multiValueHeaders: {},
        isBase64Encoded: false
      })
      expect(successResponse.body).toContain('Error: There was an error...\n    at ')
    })
  })
})

function getContextResolver (resolve) {
  const context = new MockContext(resolve)
  const contextResolver = {
    succeed: (p) => context.succeed(p.response)
  }

  return contextResolver
}

describe('forwardResponse: content-type encoding', () => {
  test('content-type header missing', () => {
    const server = new MockServer()
    const multiValueHeaders = {'foo': ['bar']}
    const body = 'hello world'
    const response = new MockResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpressTransport.forwardResponse({
          server,
          response,
          resolver: contextResolver,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway,
          logger
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: body,
      multiValueHeaders,
      isBase64Encoded: false
    }))
  })

  test('content-type image/jpeg base64 encoded', () => {
    const server = new MockServer(['image/jpeg'])
    const multiValueHeaders = {'content-type': ['image/jpeg']}
    const body = 'hello world'
    const response = new MockResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpressTransport.forwardResponse({
          server,
          response,
          resolver: contextResolver,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway,
          logger
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: Buffer.from(body).toString('base64'),
      multiValueHeaders,
      isBase64Encoded: true
    }))
  })

  test('content-type application/json', () => {
    const server = new MockServer()
    const multiValueHeaders = {'content-type': ['application/json']}
    const body = JSON.stringify({'hello': 'world'})
    const response = new MockResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpressTransport.forwardResponse({
          server,
          response,
          resolver: contextResolver,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway,
          logger
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: body,
      multiValueHeaders,
      isBase64Encoded: false
    }))
  })

  test('wildcards in binary types array', () => {
    const server = new MockServer(['image/*'])
    const multiValueHeaders = {'content-type': ['image/jpeg']}
    const body = 'hello world'
    const response = new MockResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpressTransport.forwardResponse({
          server,
          response,
          resolver: contextResolver,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway,
          logger
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: Buffer.from(body).toString('base64'),
      multiValueHeaders,
      isBase64Encoded: true
    }))
  })

  test('extensions in binary types array', () => {
    const server = new MockServer(['.png'])
    const multiValueHeaders = {'content-type': ['image/png']}
    const body = 'hello world'
    const response = new MockResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpressTransport.forwardResponse({
          server,
          response,
          resolver: contextResolver,
          eventResponseMapperFn: awsServerlessExpressEventMappings.mapResponseToApiGateway,
          logger
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: Buffer.from(body).toString('base64'),
      multiValueHeaders,
      isBase64Encoded: true
    }))
  })
})

describe('makeResolver', () => {
  test('CONTEXT (specified)', () => {
    return new Promise(
      (resolve) => {
        const context = new MockContext(resolve)
        const contextResolver = awsServerlessExpressTransport.makeResolver({
          context,
          resolutionMode: 'CONTEXT'
        })

        return contextResolver.succeed({
          response: 'success'
        })
      }).then(successResponse => expect(successResponse).toEqual('success'))
  })

  test('CALLBACK', () => {
    const callback = (e, response) => response
    const callbackResolver = awsServerlessExpressTransport.makeResolver({
      callback,
      resolutionMode: 'CALLBACK',
      context: {}
    })
    const successResponse = callbackResolver.succeed({
      response: 'success'
    })

    expect(successResponse).toEqual('success')
  })

  test('PROMISE', () => {
    return new Promise((resolve, reject) => {
      const promise = {
        resolve,
        reject
      }
      const promiseResolver = awsServerlessExpressTransport.makeResolver({
        promise,
        resolutionMode: 'PROMISE'
      })

      return promiseResolver.succeed({
        response: 'success'
      })
    }).then(successResponse => {
      expect(successResponse).toEqual('success')
    })
  })
})

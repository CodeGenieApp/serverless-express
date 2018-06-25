'use strict'

const path = require('path')

const awsServerlessExpress = require('../index')

test('getPathWithQueryStringParams: no params', () => {
  const event = {
    path: '/foo/bar'
  }
  const pathWithQueryStringParams = awsServerlessExpress.getPathWithQueryStringParams(event)
  expect(pathWithQueryStringParams).toEqual('/foo/bar')
})

test('getPathWithQueryStringParams: 1 param', () => {
  const event = {
    path: '/foo/bar',
    queryStringParameters: {
      'bizz': 'bazz'
    }
  }
  const pathWithQueryStringParams = awsServerlessExpress.getPathWithQueryStringParams(event)
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz')
})

test('getPathWithQueryStringParams: to be url-encoded param', () => {
  const event = {
    path: '/foo/bar',
    queryStringParameters: {
      'redirect_uri': 'http://lvh.me:3000/cb'
    }
  }
  const pathWithQueryStringParams = awsServerlessExpress.getPathWithQueryStringParams(event)
  expect(pathWithQueryStringParams).toEqual('/foo/bar?redirect_uri=http%3A%2F%2Flvh.me%3A3000%2Fcb')
})

test('getPathWithQueryStringParams: 2 params', () => {
  const event = {
    path: '/foo/bar',
    queryStringParameters: {
      'bizz': 'bazz',
      'buzz': 'bozz'
    }
  }
  const pathWithQueryStringParams = awsServerlessExpress.getPathWithQueryStringParams(event)
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz&buzz=bozz')
})

function mapApiGatewayEventToHttpRequest (headers) {
  const event = {
    path: '/foo',
    httpMethod: 'GET',
    body: 'Hello serverless!',
    headers
  }
  const eventClone = JSON.parse(JSON.stringify(event))
  delete eventClone.body
  const context = {
    'foo': 'bar'
  }
  const socketPath = '/tmp/server0.sock'
  const httpRequest = awsServerlessExpress.mapApiGatewayEventToHttpRequest(event, context, socketPath)

  return {httpRequest, eventClone, context}
}

test('mapApiGatewayEventToHttpRequest: with headers', () => {
  const r = mapApiGatewayEventToHttpRequest({'x-foo': 'foo'})

  expect(r.httpRequest).toEqual({
    method: 'GET',
    path: '/foo',
    headers: {
      'x-foo': 'foo',
      'Content-Length': Buffer.byteLength('Hello serverless!'),
      'x-apigateway-event': encodeURIComponent(JSON.stringify(r.eventClone)),
      'x-apigateway-context': encodeURIComponent(JSON.stringify(r.context))
    },
    socketPath: '/tmp/server0.sock'
  })
})

test('mapApiGatewayEventToHttpRequest: without headers', () => {
  const r = mapApiGatewayEventToHttpRequest()

  expect(r.httpRequest).toEqual({
    method: 'GET',
    path: '/foo',
    headers: {
      'Content-Length': Buffer.byteLength('Hello serverless!'),
      'x-apigateway-event': encodeURIComponent(JSON.stringify(r.eventClone)),
      'x-apigateway-context': encodeURIComponent(JSON.stringify(r.context))
    },
    socketPath: '/tmp/server0.sock'
  })
})

test('getSocketPath', () => {
  const socketPath = awsServerlessExpress.getSocketPath('12345abcdef')
  const isWin = process.platform === 'win32'
  const expectedSocketPath = isWin ? path.join('\\\\?\\\\pipe\\\\', process.cwd(), 'server-12345abcdef') : '/tmp/server-12345abcdef.sock'
  expect(socketPath).toBe(expectedSocketPath)
})

const PassThrough = require('stream').PassThrough

class MockResponse extends PassThrough {
  constructor (statusCode, headers, body) {
    super()
    this.statusCode = statusCode
    this.headers = headers || {}
    this.write(body)
    this.end()
  }
}

class MockServer {
  constructor (binaryTypes) {
    this._binaryTypes = binaryTypes || []
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
      (resolve, reject) => {
        const context = new MockContext(resolve)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response)
        }
        awsServerlessExpress.forwardConnectionErrorResponseToApiGateway('ERROR', contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 502,
      body: '',
      headers: {}
    }))
  })
})

describe('forwardLibraryErrorResponseToApiGateway', () => {
  test('responds with 500 status', () => {
    return new Promise(
      (resolve, reject) => {
        const context = new MockContext(resolve)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response)
        }
        awsServerlessExpress.forwardLibraryErrorResponseToApiGateway('ERROR', contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 500,
      body: '',
      headers: {}
    }))
  })
})

function getContextResolver (resolve) {
  const context = new MockContext(resolve)
  const contextResolver = {
    succeed: (p) => context.succeed(p.response)
  }

  return contextResolver
}
describe('forwardResponseToApiGateway: header handling', () => {
  test('multiple headers with the same name get transformed', () => {
    const server = new MockServer()
    const headers = {'foo': ['bar', 'baz'], 'Set-Cookie': ['bar', 'baz']}
    const body = 'hello world'
    const response = new MockResponse(200, headers, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpress.forwardResponseToApiGateway(server, response, contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: body,
      headers: { foo: 'bar,baz', 'SEt-Cookie': 'baz', 'set-Cookie': 'bar' },
      isBase64Encoded: false
    }))
  })
})

describe('forwardResponseToApiGateway: content-type encoding', () => {
  test('content-type header missing', () => {
    const server = new MockServer()
    const headers = {'foo': 'bar'}
    const body = 'hello world'
    const response = new MockResponse(200, headers, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpress.forwardResponseToApiGateway(server, response, contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: body,
      headers: headers,
      isBase64Encoded: false
    }))
  })

  test('content-type image/jpeg base64 encoded', () => {
    const server = new MockServer(['image/jpeg'])
    const headers = {'content-type': 'image/jpeg'}
    const body = 'hello world'
    const response = new MockResponse(200, headers, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpress.forwardResponseToApiGateway(server, response, contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: Buffer.from(body).toString('base64'),
      headers: headers,
      isBase64Encoded: true
    }))
  })

  test('content-type application/json', () => {
    const server = new MockServer()
    const headers = {'content-type': 'application/json'}
    const body = JSON.stringify({'hello': 'world'})
    const response = new MockResponse(200, headers, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpress.forwardResponseToApiGateway(server, response, contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: body,
      headers: headers,
      isBase64Encoded: false
    }))
  })

  test('wildcards in binary types array', () => {
    const server = new MockServer(['image/*'])
    const headers = {'content-type': 'image/jpeg'}
    const body = 'hello world'
    const response = new MockResponse(200, headers, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpress.forwardResponseToApiGateway(server, response, contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: Buffer.from(body).toString('base64'),
      headers: headers,
      isBase64Encoded: true
    }))
  })

  test('extensions in binary types array', () => {
    const server = new MockServer(['.png'])
    const headers = {'content-type': 'image/png'}
    const body = 'hello world'
    const response = new MockResponse(200, headers, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve)
        awsServerlessExpress.forwardResponseToApiGateway(server, response, contextResolver)
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: Buffer.from(body).toString('base64'),
      headers: headers,
      isBase64Encoded: true
    }))
  })
})

describe('makeResolver', () => {
  test('CONTEXT_SUCCEED (specified)', () => {
    return new Promise(
      (resolve, reject) => {
        const context = new MockContext(resolve)
        const contextResolver = awsServerlessExpress.makeResolver({
          context,
          resolutionMode: 'CONTEXT_SUCCEED'
        })

        return contextResolver.succeed({
          response: 'success'
        })
      }).then(successResponse => expect(successResponse).toEqual('success'))
  })

  test('CALLBACK', () => {
    const callback = (e, response) => response
    const callbackResolver = awsServerlessExpress.makeResolver({
      callback,
      resolutionMode: 'CALLBACK'
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
      const promiseResolver = awsServerlessExpress.makeResolver({
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

const serverlessExpressTransport = require('../src/transport')
const serverlessExpressEventSourcesUtils = require('../src/event-sources/utils')
const eventSources = require('../src/event-sources')
const makeResolver = require('../src/make-resolver')
const ServerlessRequest = require('../src/request')
const ServerlessResponse = require('../src/response')
const { log, MockContext } = require('../jest-helpers')

const apiGatewayEventSource = eventSources.getEventSource({ eventSourceName: 'AWS_API_GATEWAY_V1' })

test('getPathWithQueryStringParams: no params', () => {
  const event = {
    path: '/foo/bar'
  }
  const pathWithQueryStringParams = serverlessExpressEventSourcesUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar')
})

test('getPathWithQueryStringParams: 1 param', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      bizz: 'bazz'
    }
  }
  const pathWithQueryStringParams = serverlessExpressEventSourcesUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz')
})

test('getPathWithQueryStringParams: to be url-encoded param', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      redirect_uri: 'http://lvh.me:3000/cb'
    }
  }
  const pathWithQueryStringParams = serverlessExpressEventSourcesUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?redirect_uri=http%3A%2F%2Flvh.me%3A3000%2Fcb')
})

test('getPathWithQueryStringParams: 2 params', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      bizz: 'bazz',
      buzz: 'bozz'
    }
  }
  const pathWithQueryStringParams = serverlessExpressEventSourcesUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz&buzz=bozz')
})

test('getPathWithQueryStringParams: array param', () => {
  const event = {
    path: '/foo/bar',
    multiValueQueryStringParameters: {
      bizz: [
        'bazz',
        'buzz'
      ]
    }
  }
  const pathWithQueryStringParams = serverlessExpressEventSourcesUtils.getPathWithQueryStringParams({ event })
  expect(pathWithQueryStringParams).toEqual('/foo/bar?bizz=bazz&bizz=buzz')
})

function getReqRes (multiValueHeaders = {}) {
  const event = {
    path: '/foo',
    httpMethod: 'GET',
    body: 'Hello serverless!',
    multiValueHeaders,
    requestContext: {
      identity: {
        sourceIp: '132.33.134.75'
      }
    }
  }
  const requestValues = apiGatewayEventSource.getRequest({ event })
  const requestResponse = serverlessExpressTransport.getRequestResponse(requestValues)

  return requestResponse
}

test('getRequestResponse: with headers', async () => {
  const { request } = await getReqRes({ 'x-foo': ['foo'] })
  expect(request).toBeInstanceOf(ServerlessRequest)
  expect(request.body).toBeInstanceOf(Buffer)
  expect(request.body.toString('utf-8')).toEqual('Hello serverless!')
  delete request.body
  expect(request.method).toEqual('GET')
  expect(request.url).toEqual('/foo')
  expect(request.headers).toEqual({
    'x-foo': 'foo',
    'content-length': Buffer.byteLength('Hello serverless!')
  })
})

test('getRequestResponse: without headers', async () => {
  const requestResponse = await getReqRes()
  expect(requestResponse.request).toBeInstanceOf(ServerlessRequest)
  expect(requestResponse.request.body).toBeInstanceOf(Buffer)
  expect(requestResponse.request.body.toString('utf-8')).toEqual('Hello serverless!')
  delete requestResponse.request.body
  expect(requestResponse.request.method).toEqual('GET')
  expect(requestResponse.request.url).toEqual('/foo')
  expect(requestResponse.request.headers).toEqual({
    'content-length': Buffer.byteLength('Hello serverless!')
  })
})

describe('respondToEventSourceWithError', () => {
  test('responds with 500 status', () => {
    return new Promise(
      (resolve, reject) => {
        const context = new MockContext(resolve, reject)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response),
          fail: (p) => context.fail(p.error)
        }
        serverlessExpressTransport.respondToEventSourceWithError({
          error: new Error('ERROR'),
          resolver: contextResolver,
          log,
          eventSourceName: 'AWS_API_GATEWAY_V1',
          eventSource: apiGatewayEventSource
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
      (resolve, reject) => {
        const context = new MockContext(resolve, reject)
        const contextResolver = {
          succeed: (p) => context.succeed(p.response),
          fail: (p) => context.fail(p.error)
        }
        serverlessExpressTransport.respondToEventSourceWithError({
          error: new Error('There was an error...'),
          resolver: contextResolver,
          log,
          respondWithErrors: true,
          eventSourceName: 'AWS_API_GATEWAY_V1',
          eventSource: apiGatewayEventSource
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

function getContextResolver (resolve, reject) {
  const context = new MockContext(resolve, reject)
  const contextResolver = {
    succeed: (p) => context.succeed(p.response),
    fail: (p) => context.fail(p.error)
  }

  return contextResolver
}

describe.skip('forwardResponse: content-type encoding', () => {
  test('content-type header missing', async (done) => {
    const binaryMimeTypes = []
    const multiValueHeaders = { foo: ['bar'] }
    const { requestResponse } = await getReqRes(multiValueHeaders)
    const response = new ServerlessResponse(requestResponse.request)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve, reject)
        serverlessExpressTransport.forwardResponse({
          binaryMimeTypes,
          response,
          resolver: contextResolver,
          eventSource: apiGatewayEventSource,
          log
        })
      }
    ).then(successResponse => expect(successResponse).toEqual({
      statusCode: 200,
      body: 'Hello serverless!',
      multiValueHeaders,
      isBase64Encoded: false
    }))
      .then(() => done())
  })

  test('content-type image/jpeg base64 encoded', () => {
    const binaryMimeTypes = ['image/jpeg']
    const multiValueHeaders = { 'content-type': ['image/jpeg'] }
    const body = 'hello world'
    const response = new ServerlessResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve, reject)
        serverlessExpressTransport.forwardResponse({
          binaryMimeTypes,
          response,
          resolver: contextResolver,
          eventSource: apiGatewayEventSource,
          log
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
    const binaryMimeTypes = []
    const multiValueHeaders = { 'content-type': ['application/json'] }
    const body = JSON.stringify({ hello: 'world' })
    const response = new ServerlessResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve, reject)
        serverlessExpressTransport.forwardResponse({
          binaryMimeTypes,
          response,
          resolver: contextResolver,
          eventSource: apiGatewayEventSource,
          log
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
    const binaryMimeTypes = ['image/*']
    const multiValueHeaders = { 'content-type': ['image/jpeg'] }
    const body = 'hello world'
    const response = new ServerlessResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve, reject)
        serverlessExpressTransport.forwardResponse({
          binaryMimeTypes,
          response,
          resolver: contextResolver,
          eventSource: apiGatewayEventSource,
          log
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
    const binaryMimeTypes = ['.png']
    const multiValueHeaders = { 'content-type': ['image/png'] }
    const body = 'hello world'
    const response = new ServerlessResponse(200, multiValueHeaders, body)
    return new Promise(
      (resolve, reject) => {
        const contextResolver = getContextResolver(resolve, reject)
        serverlessExpressTransport.forwardResponse({
          binaryMimeTypes,
          response,
          resolver: contextResolver,
          eventSource: apiGatewayEventSource,
          log
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
      (resolve, reject) => {
        const context = new MockContext(resolve, reject)
        const contextResolver = makeResolver({
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
    const callbackResolver = makeResolver({
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
      const promiseResolver = makeResolver({
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

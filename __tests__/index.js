'use strict'
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

function mapApiGatewayEventToHttpRequest(headers) {
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
    const httpRequest = awsServerlessExpress.mapApiGatewayEventToHttpRequest(event, context)

    return {httpRequest, eventClone, context}
}

test('mapApiGatewayEventToHttpRequest: with headers', () => {
    const r = mapApiGatewayEventToHttpRequest({'x-foo': 'foo'})

    expect(r.httpRequest).toEqual({
        method: 'GET',
        path: '/foo',
        headers: {
            'x-foo': 'foo',
            'x-apigateway-event': encodeURIComponent(JSON.stringify(r.eventClone)),
            'x-apigateway-context': encodeURIComponent(JSON.stringify(r.context))
        }
    })
})

test('mapApiGatewayEventToHttpRequest: without headers', () => {
    const r = mapApiGatewayEventToHttpRequest()

    expect(r.httpRequest).toEqual({
        method: 'GET',
        path: '/foo',
        headers: {
            'x-apigateway-event': encodeURIComponent(JSON.stringify(r.eventClone)),
            'x-apigateway-context': encodeURIComponent(JSON.stringify(r.context))
        }
    })
})

const PassThrough = require('stream').PassThrough

class MockResponse extends PassThrough {
    constructor(statusCode, headers, body) {
        super()
        this.statusCode = statusCode
        this.headers = headers || {}
        this.write(body)
        this.end()
    }
}

class MockServer {
    constructor(binaryTypes) {
        this._binaryTypes = binaryTypes || []
    }
}

class MockContext {
    constructor(resolve) {
        this.resolve = resolve
    }
    succeed(successResponse) {
        this.resolve(successResponse)
    }
}

describe('makeContextResponse: header handling', () => {
  test('multiple headers with the same name get transformed', () => {
      const headers = {'foo': ['bar', 'baz'], 'Set-Cookie': ['bar', 'baz']}
      const body = 'hello world'
      const response = new MockResponse(200, headers, body)
      return new Promise(
          (resolve, reject) => {
              const context = new MockContext(resolve)
              context.succeed(awsServerlessExpress.makeContextResponse(new Buffer(body), response, []))
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
                const context = new MockContext(resolve)
                context.succeed(awsServerlessExpress.makeContextResponse(new Buffer(body), response, []))
            }
        ).then(successResponse => expect(successResponse).toEqual({
            statusCode: 200,
            body: body,
            headers: headers,
            isBase64Encoded: false
        }))
    })

    test('content-type image/jpeg base64 encoded', () => {
        const binaryMimeTypes = ['image/jpeg']
        const headers = {'content-type': 'image/jpeg'}
        const body = 'hello world'
        const response = new MockResponse(200, headers, body)
        return new Promise(
            (resolve, reject) => {
                const context = new MockContext(resolve)
                context.succeed(
                    awsServerlessExpress.makeContextResponse(new Buffer(body), response, binaryMimeTypes)
                )
            }
        ).then(successResponse => expect(successResponse).toEqual({
            statusCode: 200,
            body: new Buffer(body).toString('base64'),
            headers: headers,
            isBase64Encoded: true
        }))
    })

    test('content-type application/json', () => {
        const headers = {'content-type': 'application/json'}
        const body = JSON.stringify({'hello': 'world'})
        const response = new MockResponse(200, headers, body)
        return new Promise(
            (resolve, reject) => {
                const context = new MockContext(resolve)
                context.succeed(awsServerlessExpress.makeContextResponse(new Buffer(body), response, []))
            }
        ).then(successResponse => expect(successResponse).toEqual({
            statusCode: 200,
            body: body,
            headers: headers,
            isBase64Encoded: false
        }))
    })
})

describe('forwardResponseToContext', () => {
    test('Correctly creates response and forwards to context', () => {
        const headers = {'content-type': 'application/json'}
        const body = JSON.stringify({'hello': 'world'})
        const statusCode = 200
        return new Promise(
            (resolve, reject) => {
                const context = new MockContext(resolve)
                const response = awsServerlessExpress.forwardResponseToContext(context, [])
                response.writeHead(statusCode, headers)
                response.end(body)
            }
        ).then(successResponse => expect(successResponse).toEqual({
            statusCode: statusCode, body: body, headers: headers, isBase64Encoded: false
        }))
    })
})

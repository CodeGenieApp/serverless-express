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
            'x-apigateway-event': JSON.stringify(r.eventClone),
            'x-apigateway-context': JSON.stringify(r.context)
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
            'x-apigateway-event': JSON.stringify(r.eventClone),
            'x-apigateway-context': JSON.stringify(r.context)
        },
        socketPath: '/tmp/server0.sock'
    })
})

test('getSocketPath', () => {
    const socketPath = awsServerlessExpress.getSocketPath(0)
    expect(socketPath).toEqual('/tmp/server0.sock')
})

describe('forwardResponseToApiGateway: content-type encoding', () => {
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

    test('content-type header missing', () => {
        const server = new MockServer()
        const headers = {'foo': 'bar'}
        const body = 'hello world'
        const response = new MockResponse(200, headers, body)
        return new Promise(
            (resolve, reject) => {
                const context = new MockContext(resolve)
                awsServerlessExpress.forwardResponseToApiGateway(
                    server, response, context)
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
                const context = new MockContext(resolve)
                awsServerlessExpress.forwardResponseToApiGateway(
                    server, response, context)
            }
        ).then(successResponse => expect(successResponse).toEqual({
            statusCode: 200,
            body: new Buffer(body).toString('base64'),
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
                const context = new MockContext(resolve)
                awsServerlessExpress.forwardResponseToApiGateway(
                    server, response, context)
            }
        ).then(successResponse => expect(successResponse).toEqual({
            statusCode: 200,
            body: body,
            headers: headers,
            isBase64Encoded: false
        }))
    })
})

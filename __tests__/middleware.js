'use strict'
const awsServerlessExpressMiddleware = require('../middleware')
const eventContextMiddleware = awsServerlessExpressMiddleware.eventContext
const mockNext = () => true
const generateMockReq = () => {
  return {
    headers: {
      'x-apigateway-event': encodeURIComponent(JSON.stringify({
        path: '/foo/bar',
        queryStringParameters: {
          foo: '🖖',
          bar: '~!@#$%^&*()_+`-=;\':",./<>?`'
        }
      })),
      'x-apigateway-context': encodeURIComponent(JSON.stringify({foo: 'bar'}))
    }
  }
}
const generateMockALBReq = () => {
  return {
    headers: {
      'x-alb-event': encodeURIComponent(JSON.stringify({
        path: '/foo/bar',
        queryStringParameters: {
          foo: '🖖',
          bar: '~!@#$%^&*()_+`-=;\':",./<>?`'
        }
      })),
      'x-alb-context': encodeURIComponent(JSON.stringify({foo: 'bar'}))
    }
  }
}
const mockRes = {}

describe('when request is from API Gateway', () => {
  test('defaults', () => {
    const req = generateMockReq()
    const originalHeaders = Object.assign({}, req.headers)

    eventContextMiddleware()(req, mockRes, mockNext)

    expect(req.apiGateway.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-apigateway-event'])))
    expect(req.apiGateway.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-apigateway-context'])))
    expect(req.headers['x-apigateway-event']).toBe(undefined)
    expect(req.headers['x-apigateway-context']).toBe(undefined)
  })

  test('options.reqPropKey', () => {
    const req = generateMockReq()
    const originalHeaders = Object.assign({}, req.headers)

    eventContextMiddleware({ reqPropKey: '_apiGateway' })(req, mockRes, mockNext)

    expect(req._apiGateway.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-apigateway-event'])))
    expect(req._apiGateway.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-apigateway-context'])))
    expect(req.headers['x-apigateway-event']).toBe(undefined)
    expect(req.headers['x-apigateway-context']).toBe(undefined)
  })

  test('options.deleteHeaders = false', () => {
    const req = generateMockReq()
    const originalHeaders = Object.assign({}, req.headers)

    eventContextMiddleware({ deleteHeaders: false })(req, mockRes, mockNext)

    expect(req.apiGateway.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-apigateway-event'])))
    expect(req.apiGateway.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-apigateway-context'])))
    expect(req.headers['x-apigateway-event']).toEqual(originalHeaders['x-apigateway-event'])
    expect(req.headers['x-apigateway-context']).toEqual(originalHeaders['x-apigateway-context'])
  })

  test('Missing x-apigateway-event', () => {
    const req = generateMockReq()
    delete req.headers['x-apigateway-event']

    eventContextMiddleware({ deleteHeaders: false })(req, mockRes, mockNext)

    expect(req.apiGateway).toBe(undefined)
  })

  test('Missing x-apigateway-context', () => {
    const req = generateMockReq()
    delete req.headers['x-apigateway-context']

    eventContextMiddleware({ deleteHeaders: false })(req, mockRes, mockNext)

    expect(req.apiGateway).toBe(undefined)
  })
})

describe('when request is from ALB', () => {
  test('defaults', () => {
    const req = generateMockALBReq()
    const originalHeaders = Object.assign({}, req.headers)

    eventContextMiddleware({ fromALB: true })(req, mockRes, mockNext)

    expect(req.alb.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-alb-event'])))
    expect(req.alb.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-alb-context'])))
    expect(req.headers['x-alb-event']).toBe(undefined)
    expect(req.headers['x-alb-context']).toBe(undefined)
  })

  test('options.reqPropKey', () => {
    const req = generateMockALBReq()
    const originalHeaders = Object.assign({}, req.headers)

    eventContextMiddleware({ reqPropKey: '_alb', fromALB: true })(req, mockRes, mockNext)

    expect(req._alb.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-alb-event'])))
    expect(req._alb.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-alb-context'])))
    expect(req.headers['x-alb-event']).toBe(undefined)
    expect(req.headers['x-alb-context']).toBe(undefined)
  })

  test('options.deleteHeaders = false', () => {
    const req = generateMockALBReq()
    const originalHeaders = Object.assign({}, req.headers)

    eventContextMiddleware({ deleteHeaders: false, fromALB: true })(req, mockRes, mockNext)

    expect(req.alb.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-alb-event'])))
    expect(req.alb.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-alb-context'])))
    expect(req.headers['x-alb-event']).toEqual(originalHeaders['x-alb-event'])
    expect(req.headers['x-alb-context']).toEqual(originalHeaders['x-alb-context'])
  })

  test('Missing x-alb-event', () => {
    const req = generateMockALBReq()
    delete req.headers['x-alb-event']

    eventContextMiddleware({ deleteHeaders: false, fromALB: true })(req, mockRes, mockNext)

    expect(req.alb).toBe(undefined)
  })

  test('Missing x-alb-context', () => {
    const req = generateMockALBReq()
    delete req.headers['x-alb-context']

    eventContextMiddleware({ deleteHeaders: false, fromALB: true })(req, mockRes, mockNext)

    expect(req.alb).toBe(undefined)
  })
})

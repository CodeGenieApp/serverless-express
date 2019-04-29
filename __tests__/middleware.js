'use strict'
const awsServerlessExpressMiddleware = require('../middleware')
const eventContextMiddleware = awsServerlessExpressMiddleware.eventContext
const mockNext = () => true
const generateMockReq = () => {
  return {
    headers: {
      'x-lambda-event': encodeURIComponent(JSON.stringify({
        path: '/foo/bar',
        queryStringParameters: {
          foo: '🖖',
          bar: '~!@#$%^&*()_+`-=;\':",./<>?`'
        }
      })),
      'x-lambda-context': encodeURIComponent(JSON.stringify({foo: 'bar'}))
    }
  }
}
const mockRes = {}

test('defaults', () => {
  const req = generateMockReq()
  const originalHeaders = Object.assign({}, req.headers)

  eventContextMiddleware()(req, mockRes, mockNext)

  expect(req.lambda.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-lambda-event'])))
  expect(req.lambda.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-lambda-context'])))
  expect(req.headers['x-lambda-event']).toBe(undefined)
  expect(req.headers['x-lambda-context']).toBe(undefined)
})

test('options.reqPropKey', () => {
  const req = generateMockReq()
  const originalHeaders = Object.assign({}, req.headers)

  eventContextMiddleware({ reqPropKey: '_apiGateway' })(req, mockRes, mockNext)

  expect(req._apiGateway.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-lambda-event'])))
  expect(req._apiGateway.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-lambda-context'])))
  expect(req.headers['x-lambda-event']).toBe(undefined)
  expect(req.headers['x-lambda-context']).toBe(undefined)
})

test('options.deleteHeaders = false', () => {
  const req = generateMockReq()
  const originalHeaders = Object.assign({}, req.headers)

  eventContextMiddleware({ deleteHeaders: false })(req, mockRes, mockNext)

  expect(req.lambda.event).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-lambda-event'])))
  expect(req.lambda.context).toEqual(JSON.parse(decodeURIComponent(originalHeaders['x-lambda-context'])))
  expect(req.headers['x-lambda-event']).toEqual(originalHeaders['x-lambda-event'])
  expect(req.headers['x-lambda-context']).toEqual(originalHeaders['x-lambda-context'])
})

test('Missing x-lambda-event', () => {
  const req = generateMockReq()
  delete req.headers['x-lambda-event']

  eventContextMiddleware({ deleteHeaders: false })(req, mockRes, mockNext)

  expect(req.lambda).toBe(undefined)
})

test('Missing x-lambda-context', () => {
  const req = generateMockReq()
  delete req.headers['x-lambda-context']

  eventContextMiddleware({ deleteHeaders: false })(req, mockRes, mockNext)

  expect(req.lambda).toBe(undefined)
})

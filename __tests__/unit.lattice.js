const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const latticeEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_VPC_LATTICE_V2'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.method).toEqual('GET')
  expect(req.path).toEqual('/test-path?key=value')
  expect(req.headers).toEqual({
    'x-custom-header': 'test-header',
    'content-length': 15
  })
  expect(Buffer.isBuffer(req.body)).toEqual(true)
})

test('response is correct', () => {
  const res = getRes()
  expect(typeof res).toEqual('object')
  expect(res.statusCode).toEqual(200)
  expect(res.body).toEqual('{"message":"Hello, world!"}')
  expect(res.headers).toEqual({ 'Content-Type': 'application/json' })
  expect(res.isBase64Encoded).toEqual(false)
})

function getReq () {
  const event = testUtils.latticeEvent
  const request = latticeEventSource.getRequest({ event })
  return request
}

function getRes () {
  const event = testUtils.latticeEvent
  const response = latticeEventSource.getResponse({
    event,
    statusCode: 200,
    body: '{"message":"Hello, world!"}',
    headers: { 'Content-Type': 'application/json' },
    isBase64Encoded: false
  })
  return response
}

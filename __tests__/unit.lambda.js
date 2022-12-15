const eventSources = require('../src/event-sources')

const LambdaEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_LAMBDA'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'lambda.amazonaws.com' })
  expect(req.body).toEqual({})
  expect(req.method).toEqual('POST')
})

function getReq () {
  const event = {}
  return LambdaEventSource.getRequest({ event })
}

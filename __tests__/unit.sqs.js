const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const sqsEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_SQS'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'sqs.amazonaws.com' })
  expect(req.body).toEqual(testUtils.sqsEvent)
  expect(req.method).toEqual('POST')
})

function getReq () {
  const event = testUtils.sqsEvent
  const request = sqsEventSource.getRequest({ event })
  return request
}

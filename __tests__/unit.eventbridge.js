const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const dynamodbEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_EVENTBRIDGE'
})

test('request is correct', () => {
  const req = getReq({ event: testUtils.eventbridgeEvent })
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'events.amazonaws.com' })
  expect(req.body).toEqual(testUtils.eventbridgeEvent)
  expect(req.method).toEqual('POST')
})

test('request is correct (scheduled)', () => {
  const req = getReq({ event: testUtils.eventbridgeScheduledEvent })
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'events.amazonaws.com' })
  expect(req.body).toEqual(testUtils.eventbridgeScheduledEvent)
  expect(req.method).toEqual('POST')
})

function getReq ({ event }) {
  const request = dynamodbEventSource.getRequest({ event })
  return request
}

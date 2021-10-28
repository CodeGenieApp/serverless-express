const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const snsEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_SNS'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'sns.amazonaws.com' })
  expect(req.body).toEqual(testUtils.snsEvent)
  expect(req.method).toEqual('POST')
})

function getReq () {
  const event = testUtils.snsEvent
  const request = snsEventSource.getRequest({ event })
  return request
}

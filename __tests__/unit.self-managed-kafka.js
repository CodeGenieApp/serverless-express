const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const selfManagedKafkaEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_SELF_MANAGED_KAFKA'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'self-managed-kafka' })
  expect(req.body).toEqual(testUtils.selfManagedKafkaEvent)
  expect(req.method).toEqual('POST')
})

function getReq () {
  const event = testUtils.selfManagedKafkaEvent
  const request = selfManagedKafkaEventSource.getRequest({ event })
  return request
}

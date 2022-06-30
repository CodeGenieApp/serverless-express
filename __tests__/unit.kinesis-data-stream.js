const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const kinesisDataStreamEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_KINESIS_DATA_STREAM'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'kinesis.amazonaws.com' })
  expect(req.body).toEqual(testUtils.kinesisDataStreamEvent)
  expect(req.method).toEqual('POST')
})

function getReq () {
  const event = testUtils.kinesisDataStreamEvent
  const request = kinesisDataStreamEventSource.getRequest({ event })
  return request
}

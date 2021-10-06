const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const dynamodbEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_DYNAMODB'
})

test('request is correct', () => {
  const req = getReq()
  expect(typeof req).toEqual('object')
  expect(req.headers).toEqual({ host: 'dynamodb.amazonaws.com' })
  expect(req.body).toEqual(testUtils.dynamoDbEvent)
  expect(req.method).toEqual('POST')
})

function getReq () {
  const event = testUtils.dynamoDbEvent
  const request = dynamodbEventSource.getRequest({ event })
  return request
}

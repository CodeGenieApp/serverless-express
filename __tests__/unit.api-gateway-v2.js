const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const apiGatewayEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_API_GATEWAY_V2'
})

test('request has correct headers', () => {
  const req = getReq()
  // see https://github.com/vendia/serverless-express/issues/387
  expect(typeof req).toEqual('object')
  expect(JSON.stringify(req.headers)).toEqual(
    '{"cookie":"","host":"localhost:9000","user-agent":"curl/7.64.1","accept":"*/*","x-forwarded-proto":"http","x-forwarded-port":"9000"}'
  )
})

function getReq () {
  const event = testUtils.samHttpApiEvent
  const request = apiGatewayEventSource.getRequest({ event })
  return request
}

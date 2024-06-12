const eventSources = require('../src/event-sources')
const testUtils = require('./utils')

const apiGatewayEventSource = eventSources.getEventSource({
  eventSourceName: 'AWS_API_GATEWAY_V1'
})

test('request has correct headers', () => {
  const req = getReq()
  // see https://github.com/CodeGenieApp/serverless-express/issues/387
  expect(typeof req).toEqual('object')
  expect(JSON.stringify(req.headers)).toEqual(
    '{"accept":"application/json","content-type":"application/json","content-length":22}'
  )
})

function getReq () {
  const event = testUtils.apiGatewayV1Event
  const request = apiGatewayEventSource.getRequest({ event })
  return request
}

const express = require('express')
const serverlessExpress = require('../../..')
const { log, makeApiGatewayV2Event } = require('../../../jest-helpers')

const app = express()

app.get('/', (req, res) => {
  res.json({})
})

app.get('/custom-header', (req, res) => {
  res.set('X-Custom-Header', 'test')

  res.json({})
})

const serverlessExpressInstance = serverlessExpress({ app, log })

describe('API Gateway V2 Integ', () => {
  test('simple response', async () => {
    const event = makeApiGatewayV2Event({ rawPath: '/' })
    const response = await serverlessExpressInstance.handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual('{}')
    expect(response.isBase64Encoded).toEqual(false)
    expect(response.headers['x-powered-by']).toEqual('Express')
    expect(response.headers['content-type']).toEqual('application/json; charset=utf-8')
    expect(response.headers['content-length']).toEqual('2')
    expect(response.headers['etag']).toEqual('W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"')
  })
  test('returns custom header', async () => {
    const event = makeApiGatewayV2Event({ rawPath: '/custom-header' })
    const response = await serverlessExpressInstance.handler(event)
    expect(response.headers['x-custom-header']).toEqual('test')
  })
})

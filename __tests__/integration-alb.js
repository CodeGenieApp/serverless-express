const express = require('express')
const serverlessExpress = require('../src/index')
const {
  makeEvent,
  makeResponse
} = require('../jest-helpers')

describe('alb:express integration tests', () => {
  test('reasponse headers are of type string', async () => {
    const app = express()
    const router = express.Router()
    app.use('/', router)
    const serverlessExpressInstance = serverlessExpress({ app })
    router.get('/foo', (req, res) => {
      res.send('123')
    })
    const event = makeEvent({
      eventSourceName: 'alb',
      path: '/foo',
      httpMethod: 'GET',
      headers: {}
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName: 'alb',
      body: '123',
      headers: {
        'content-length': '3',
        'content-type': 'text/html; charset=utf-8',
        'x-powered-by': 'Express',
        etag: 'W/"3-QL0AFWMIX8NRZTKeof9cXsvbvu8"'
      },
      multiValueHeaders: undefined
    })
    expect(response).toMatchObject(expectedResponse)
  })
})

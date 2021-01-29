const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs').__express
const serverlessExpress = require('../src/index')
const {
  log,
  makeEvent,
  makeResponse,
  EACH_MATRIX
} = require('../jest-helpers')

const jestHelpersPath = path.join(__dirname, '..', 'jest-helpers')

let app, router, serverlessExpressInstance

describe.each(EACH_MATRIX)('%s:%s: integration tests', (eventSourceName, frameworkName) => {
  beforeEach(() => {
    app = express()
    router = express.Router()
    app.set('view engine', 'ejs')
    app.engine('.ejs', ejs)
    app.set('views', path.join(jestHelpersPath, 'views'))
    app.use('/', router)
    serverlessExpressInstance = serverlessExpress({ app, log })
  })

  test('handler returns promise', () => {
    const event = makeEvent({
      eventSourceName,
      path: '/',
      httpMethod: 'GET'
    })
    const response = serverlessExpressInstance.handler(event)
    expect(response.then).toBeTruthy()
  })

  test('GET HTML', async () => {
    router.get('/', (req, res) => {
      const currentInvoke = serverlessExpress.getCurrentInvoke()
      const eventPath = currentInvoke.event.path || currentInvoke.event.rawPath
      res.render('index', {
        path: eventPath
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    const expected = `<!DOCTYPE html><html><body>/</body></html>`
    expect(response.body).toEqual(expected)
    const expectedResponse = makeResponse({
      eventSourceName,
      multiValueHeaders: {
        'content-length': ['42'],
        'content-type': ['text/html; charset=utf-8'],
        etag: ['W/"2a-wmySkjN5My1aqVauhBIBaC50kxs"']
      }
    })
    delete response.body
    delete expectedResponse.body
    expect(response).toEqual(expectedResponse)
  })

  test('GET JSON', async () => {
    const jsonResponse = { data: { name: 'Brett' } }
    router.get('/users', (req, res) => {
      res.json(jsonResponse)
    })

    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify(jsonResponse),
      multiValueHeaders: {
        'content-length': ['25'],
        etag: ['W/"19-dkLV0OMoaMM+tzXUD50EB/AHHoI"']
      }
    })
    expect(response).toEqual(expectedResponse)
  })

  test('GET JSON (resolutionMode = CALLBACK)', (done) => {
    const jsonResponse = { data: { name: 'Brett' } }
    router.get('/users', (req, res) => {
      res.json(jsonResponse)
    })
    const callback = (e, response) => {
      const expectedResponse = makeResponse({
        eventSourceName,
        body: JSON.stringify(jsonResponse),
        multiValueHeaders: {
          'content-length': ['25'],
          etag: ['W/"19-dkLV0OMoaMM+tzXUD50EB/AHHoI"']
        }
      })
      expect(response).toEqual(expectedResponse)
      done()
    }

    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const serverlessExpressInstanceWithCallbackResolutionMode = serverlessExpress({ app, log, resolutionMode: 'CALLBACK' })
    serverlessExpressInstanceWithCallbackResolutionMode.handler(event, {}, callback)
  })

  test('GET JSON (resolutionMode = CONTEXT)', (done) => {
    const jsonResponse = { data: { name: 'Brett' } }
    router.get('/users', (req, res) => {
      res.json(jsonResponse)
    })
    const context = {}
    context.succeed = (response) => {
      const expectedResponse = makeResponse({
        eventSourceName,
        body: JSON.stringify(jsonResponse),
        multiValueHeaders: {
          'content-length': ['25'],
          etag: ['W/"19-dkLV0OMoaMM+tzXUD50EB/AHHoI"']
        }
      })
      expect(response).toEqual(expectedResponse)
      done()
    }
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const serverlessExpressInstanceWithContextResolutionMode = serverlessExpress({ app, log, resolutionMode: 'CONTEXT' })
    serverlessExpressInstanceWithContextResolutionMode.handler(event, context)
  })

  test('GET missing route', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/nothing-here',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = makeResponse({
      eventSourceName,
      multiValueHeaders: {
        'content-length': [151],
        'content-security-policy': ["default-src 'none'"],
        'content-type': ['text/html; charset=utf-8'],
        'x-content-type-options': ['nosniff']
      },
      statusCode: 404
    }, { shouldConvertContentLengthToInt: true })
    delete response.body
    delete expectedResponse.body
    expect(response).toEqual(expectedResponse)
  })

  test('GET 404', async () => {
    router.get('/users/:id', (req, res) => {
      res.status(404).json({})
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users/3',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: '{}',
      multiValueHeaders: {
        'content-length': ['2'],
        etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
      },
      statusCode: 404
    })
    expect(response).toEqual(expectedResponse)
  })

  test('GET image', async () => {
    const samLogoPath = path.join(jestHelpersPath, 'sam-logo.png')
    router.get('/sam', (req, res) => {
      res.sendFile(samLogoPath)
    })
    const event = makeEvent({
      eventSourceName,
      path: '/sam',
      httpMethod: 'GET'
    })

    const response = await serverlessExpressInstance.handler(event)

    const samLogoImage = fs.readFileSync(samLogoPath)
    const samLogoBase64 = Buffer.from(samLogoImage).toString('base64')
    const expectedResponse = makeResponse({
      eventSourceName,
      body: samLogoBase64,
      multiValueHeaders: {
        'accept-ranges': ['bytes'],
        'cache-control': ['public, max-age=0'],
        'content-length': [15933],
        'content-type': ['image/png'],
        'etag': ['W/"3e3d-1774d22e86c"'],
        'last-modified': ['Fri, 29 Jan 2021 07:54:29 GMT']
      },
      isBase64Encoded: true
    }, { shouldConvertContentLengthToInt: true })
    expect(response).toEqual(expectedResponse)
  })

  test('POST JSON', async () => {
    const newName = 'Sandy Samantha Salamander'
    router.use(bodyParser.json())
    router.post('/users', (req, res) => {
      res.status(201).json({ data: { name: req.body.name } })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'POST',
      body: `{"name": "${newName}"}`,
      multiValueHeaders: {
        'content-type': ['application/json']
      }
    })
    const response = await serverlessExpressInstance.handler(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ data: { name: newName } }),
      multiValueHeaders: {
        'content-length': ['45'],
        etag: ['W/"2d-dg5Fo2Yl1Nlaw+cIP3w6t3RxAHk"']
      },
      statusCode: 201
    })
    expect(response).toEqual(expectedResponse)
  })

  // test('DELETE JSON', async () => {
  //   const event = makeEvent({
  //     eventSourceName,
  //     path: '/users/1',
  //     httpMethod: 'DELETE'
  //   })
  //   const response = await serverlessExpressInstance.handler(event)
  //   const expectedResponse = makeResponse({
  //     eventSourceName,
  //     body: `[{"id":2,"name":"Jane"},{"id":3,"name":"${newName}"}]`,
  //     multiValueHeaders: {
  //       'content-length': ['68'],
  //       etag: ['W/"44-AtuxlvrIBL8NXP4gvEQTI77suNg"']
  //     },
  //     statusCode: 200
  //   })
  //   expect(response).toEqual(expectedResponse)
  // })

  // test('PUT JSON', async () => {
  //   const event = makeEvent({
  //     eventSourceName,
  //     path: '/users/2',
  //     httpMethod: 'PUT',
  //     body: '{"name": "Samuel"}'
  //   })
  //   const response = await serverlessExpressInstance.handler(event)
  //   const expectedResponse = makeResponse({
  //     eventSourceName,
  //     body: '{"id":2,"name":"Samuel"}',
  //     multiValueHeaders: {
  //       'content-length': ['24'],
  //       etag: ['W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"']
  //     },
  //     statusCode: 200
  //   })
  //   expect(response).toEqual(expectedResponse)
  // })

  // test('base64 encoded request', async () => {
  //   const event = makeEvent({
  //     eventSourceName,
  //     path: '/users/2',
  //     httpMethod: 'PUT',
  //     body: global.btoa('{"name": "Samuel"}'),
  //     isBase64Encoded: true
  //   })
  //   const response = await serverlessExpressInstance.handler(event)
  //   const expectedResponse = makeResponse({
  //     eventSourceName,
  //     body: '{"id":2,"name":"Samuel"}',
  //     multiValueHeaders: {
  //       'access-control-allow-origin': [
  //         '*'
  //       ],
  //       'content-length': [
  //         '24'
  //       ],
  //       'content-type': [
  //         'application/json; charset=utf-8'
  //       ],
  //       etag: [
  //         'W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"'
  //       ],
  //       'x-powered-by': [
  //         'Express'
  //       ]
  //     },
  //     statusCode: 200
  //   })
  //   expect(response).toEqual(expectedResponse)
  // })

  // test.skip('respondToEventSourceWithError', async () => {
  //   const response = await serverlessExpressInstance.handler(null)
  //   expect(response).toEqual({
  //     statusCode: 500,
  //     body: '',
  //     multiValueHeaders: {}
  //   })
  // })

  // test('Multiple headers of the same name (set-cookie)', async () => {
  //   const event = makeEvent({
  //     eventSourceName,
  //     path: '/cookie',
  //     httpMethod: 'GET'
  //   })
  //   const response = await serverlessExpressInstance.handler(event)

  //   const expectedSetCookieHeaders = [
  //     'Foo=bar; Path=/',
  //     'Fizz=buzz; Path=/'
  //   ]
  //   const expectedResponse = makeResponse({
  //     eventSourceName,
  //     body: '{}',
  //     multiValueHeaders: {
  //       'set-cookie': expectedSetCookieHeaders,
  //       'content-length': ['2'],
  //       etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
  //     },
  //     statusCode: 200
  //   })
  //   expect(response).toEqual(expectedResponse)
  // })
})

const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs').__express
const serverlessExpress = require('../src/index')
const {
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
    app.use('/', router)
    serverlessExpressInstance = serverlessExpress({ app })
  })

  test('serverlessExpressInstance returns promise', () => {
    const event = makeEvent({
      eventSourceName,
      path: '/',
      httpMethod: 'GET'
    })
    const response = serverlessExpressInstance(event)
    expect(response.then).toBeTruthy()
  })

  test('GET HTML', async () => {
    app.set('view engine', 'ejs')
    app.engine('.ejs', ejs)
    app.set('views', path.join(jestHelpersPath, 'views'))
    router.get('/', (req, res) => {
      const { event } = serverlessExpress.getCurrentInvoke()
      const eventPath = event.path || event.rawPath || event.Records[0].cf.request.uri
      res.render('index', {
        path: eventPath
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance(event)
    const expected = '<!DOCTYPE html><html><body>/</body></html>'
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
    const multiValueQueryStringParameters = {
      singleNormal: ['1'],
      singleSpecial: ['hello world!'],
      arr: ['a', 'b', 'hello world~']
    }
    const queryStringParameters = {
      singleNormal: '1',
      singleSpecial: 'hello world!',
      arr: 'hello world~'
    }
    router.get('/users', (req, res) => {
      const { singleNormal, singleSpecial, arr } = req.query
      res.set('X-Custom-Header', singleNormal)
      res.json({ singleNormal, singleSpecial, arr })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET',
      queryStringParameters,
      multiValueQueryStringParameters
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({
        ...queryStringParameters,
        arr: multiValueQueryStringParameters.arr
      }),
      multiValueHeaders: {
        'content-length': ['82'],
        etag: ['W/"52-QR4hWttXm/4xeZPYy7nze/EjYXg"'],
        'x-custom-header': ['1']
      }
    })
    expect(response).toEqual(expectedResponse)
  })

  test('resolutionMode = CALLBACK', (done) => {
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
    const serverlessExpressInstanceWithCallbackResolutionMode = serverlessExpress({ app, resolutionMode: 'CALLBACK' })
    serverlessExpressInstanceWithCallbackResolutionMode(event, {}, callback)
  })

  test('resolutionMode = CONTEXT', (done) => {
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
    const serverlessExpressInstanceWithContextResolutionMode = serverlessExpress({ app, resolutionMode: 'CONTEXT' })
    serverlessExpressInstanceWithContextResolutionMode(event, context)
  })

  test('GET missing route', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/nothing-here',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance(event)
    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = makeResponse({
      eventSourceName,
      multiValueHeaders: {
        'content-length': ['151'],
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
    router.get('/users/:userId', (req, res) => {
      res.status(404).json({ id: req.params.userId })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users/3',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ id: '3' }),
      multiValueHeaders: {
        'content-length': ['10'],
        etag: ['W/"a-lfm5LdsGBlIttC0+rnSiywX9+Wc"']
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

    const response = await serverlessExpressInstance(event)

    const samLogoImage = fs.readFileSync(samLogoPath)
    const samLogoBase64 = Buffer.from(samLogoImage).toString('base64')
    const expectedResponse = makeResponse({
      eventSourceName,
      body: samLogoBase64,
      multiValueHeaders: {
        'accept-ranges': ['bytes'],
        'cache-control': ['public, max-age=0'],
        'content-length': ['15933'],
        'content-type': ['image/png']
      },
      isBase64Encoded: true
    }, { shouldConvertContentLengthToInt: true })
    const etagRegex = /^W\/.*$/
    const lastModifiedRegex = /^.* GMT$/
    switch (eventSourceName) {
      case 'alb':
      case 'apiGatewayV1':
        expect(response.multiValueHeaders.etag.length).toEqual(1)
        expect(response.multiValueHeaders.etag[0]).toMatch(etagRegex)
        expect(response.multiValueHeaders['last-modified'].length).toEqual(1)
        expect(response.multiValueHeaders['last-modified'][0]).toMatch(lastModifiedRegex)
        delete response.multiValueHeaders.etag
        delete response.multiValueHeaders['last-modified']
        break
      case 'azureHttpFunctionV3':
        expectedResponse.body = Buffer.from(samLogoBase64, 'base64')
        expectedResponse.isBase64Encoded = false
        expect(response.headers.etag).toMatch(etagRegex)
        expect(response.headers['last-modified']).toMatch(lastModifiedRegex)
        delete response.headers.etag
        delete response.headers['last-modified']
        break
      case 'apiGatewayV2':
        expect(response.headers.etag).toMatch(etagRegex)
        expect(response.headers['last-modified']).toMatch(lastModifiedRegex)
        delete response.headers.etag
        delete response.headers['last-modified']
        break
      case 'lambdaEdge':
        expect(response.headers.etag.length).toEqual(1)
        expect(response.headers.etag[0].key).toMatch('etag')
        expect(response.headers.etag[0].value).toMatch(etagRegex)
        expect(response.headers['last-modified'].length).toEqual(1)
        expect(response.headers['last-modified'][0].key).toMatch('last-modified')
        expect(response.headers['last-modified'][0].value).toMatch(lastModifiedRegex)
        delete response.headers.etag
        delete response.headers['last-modified']
        break
    }
    expect(response).toEqual(expectedResponse)
  })

  test('POST JSON', async () => {
    const name = 'Squidward'
    router.use(bodyParser.json())
    router.post('/users', (req, res) => {
      res.status(201).json({ data: { name: req.body.name } })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'POST',
      body: `{"name": "${name}"}`,
      multiValueHeaders: {
        'content-type': ['application/json']
      }
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ data: { name: name } }),
      multiValueHeaders: {
        'content-length': ['29'],
        etag: ['W/"1d-9ERga12t1e/5eBdg3k9zfIvAfWo"']
      },
      statusCode: 201
    })
    expect(response).toEqual(expectedResponse)
  })

  test('DELETE JSON', async () => {
    router.delete('/users/:id', (req, res) => {
      res.json([])
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users/1',
      httpMethod: 'DELETE'
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: '[]',
      multiValueHeaders: {
        'content-length': ['2'],
        etag: ['W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"']
      },
      statusCode: 200
    })
    expect(response).toEqual(expectedResponse)
  })

  test('PUT JSON', async () => {
    const name = 'Spongebob'
    router.use(bodyParser.json())
    router.put('/users/:id', (req, res) => {
      res.json({
        id: req.params.id,
        ...req.body
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users/2',
      httpMethod: 'PUT',
      body: JSON.stringify({ name }),
      multiValueHeaders: {
        'content-type': ['application/json']
      }
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ id: '2', name }),
      multiValueHeaders: {
        'content-length': ['29'],
        etag: ['W/"1d-S5aeqkgQbnSMqjyXJrRTGxN4UiY"']
      },
      statusCode: 200
    })
    expect(response).toEqual(expectedResponse)
  })

  test('base64 encoded request', async () => {
    const name = 'Patrick'
    router.use(bodyParser.json())
    router.put('/users/:id', (req, res) => {
      res.json({
        id: req.params.id,
        ...req.body
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users/2',
      httpMethod: 'PUT',
      body: Buffer.from(JSON.stringify({ name }), 'binary').toString('base64'),
      isBase64Encoded: true,
      multiValueHeaders: {
        'content-type': ['application/json']
      }
    })
    const response = await serverlessExpressInstance(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ id: '2', name }),
      multiValueHeaders: {
        'content-length': [
          '27'
        ],
        etag: [
          'W/"1b-bCkbUU5T9Cepc4SpN5w/iwctZZw"'
        ]
      },
      statusCode: 200
    })
    expect(response).toEqual(expectedResponse)
  })

  test.skip('respondToEventSourceWithError', async () => {
    const response = await serverlessExpressInstance(null)
    expect(response).toEqual({
      statusCode: 500,
      body: '',
      multiValueHeaders: {}
    })
  })

  test('set-cookie', async () => {
    router.get('/cookie', (req, res) => {
      res.cookie('Foo', 'bar', { domain: 'example.com', secure: true, httpOnly: true, sameSite: 'Strict' })
      res.cookie('Fizz', 'buzz')
      res.json({})
    })
    const event = makeEvent({
      eventSourceName,
      path: '/cookie',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance(event)

    const expectedSetCookieHeaders = [
      'Foo=bar; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Strict',
      'Fizz=buzz; Path=/'
    ]
    const expectedResponse = makeResponse({
      eventSourceName,
      body: '{}',
      cookies: expectedSetCookieHeaders,
      multiValueHeaders: {
        'set-cookie': expectedSetCookieHeaders,
        'content-length': ['2'],
        etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
      },
      statusCode: 200
    })

    switch (eventSourceName) {
      case 'azureHttpFunctionV3':
        expectedResponse.cookies = [
          {
            domain: 'example.com',
            httpOnly: true,
            name: 'Foo',
            path: '/',
            sameSite: 'Strict',
            secure: true,
            value: 'bar'
          },
          { name: 'Fizz', path: '/', value: 'buzz' }
        ]
        break
    }

    expect(response).toEqual(expectedResponse)
  })

  test('custom logger', async () => {
    app = express()
    router = express.Router()
    app.use('/', router)
    router.get('/users', (req, res) => {
      res.json({})
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const customLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      verbose: jest.fn(),
      debug: jest.fn()
    }
    serverlessExpressInstance = serverlessExpress({ app, log: customLogger })
    await serverlessExpressInstance(event)

    expect(customLogger.debug.mock.calls.length).toBe(6)

    // TODO: test log levels
    // customLogger.level = 'error'
    // customLogger.debug.mockClear()
    // customLogger.debug.mockReset()
    // customLogger.debug = jest.fn()

    // serverlessExpressInstance = serverlessExpress({ app, log: customLogger })
    // await serverlessExpressInstance(event)
    // expect(customLogger.debug.mock.calls.length).toBe(0)
  })

  test('legacy/deprecated createServer', async () => {
    const serverlessExpressMiddleware = require('../src/middleware')
    app = express()
    router = express.Router()
    app.use('/', router)
    router.use(serverlessExpressMiddleware.eventContext())
    router.get('/users', (req, res) => {
      const { event } = req.apiGateway
      const eventPath = event.path || event.rawPath || event.Records[0].cf.request.uri
      res.json({
        path: eventPath
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const binaryMimeTypes = []
    const server = serverlessExpress.createServer(app, null, binaryMimeTypes)
    const response = await serverlessExpress.proxy(server, event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ path: '/users' }),
      multiValueHeaders: {
        'content-length': ['17'],
        etag: ['W/"11-eM8YArY+qNwdvTL2ppeAaFc4Oq8"']
      },
      statusCode: 200
    })
    expect(response).toEqual(expectedResponse)
  })

  test('legacy/deprecated handler', async () => {
    const serverlessExpressMiddleware = require('../src/middleware')
    router.use(serverlessExpressMiddleware.eventContext())
    router.get('/users', (req, res) => {
      const { event } = req.apiGateway
      const eventPath = event.path || event.rawPath || event.Records[0].cf.request.uri
      res.json({
        path: eventPath
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ path: '/users' }),
      multiValueHeaders: {
        'content-length': ['17'],
        etag: ['W/"11-eM8YArY+qNwdvTL2ppeAaFc4Oq8"']
      },
      statusCode: 200
    })
    expect(response).toEqual(expectedResponse)
  })

  test('legacy/deprecated proxy', async () => {
    const serverlessExpressMiddleware = require('../src/middleware')
    router.use(serverlessExpressMiddleware.eventContext())
    router.get('/users', (req, res) => {
      const { event } = req.apiGateway
      const eventPath = event.path || event.rawPath || event.Records[0].cf.request.uri
      res.json({
        path: eventPath
      })
    })
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.proxy({ event })
    const expectedResponse = makeResponse({
      eventSourceName,
      body: JSON.stringify({ path: '/users' }),
      multiValueHeaders: {
        'content-length': ['17'],
        etag: ['W/"11-eM8YArY+qNwdvTL2ppeAaFc4Oq8"']
      },
      statusCode: 200
    })
    expect(response).toEqual(expectedResponse)
  })
})

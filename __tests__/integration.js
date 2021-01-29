const path = require('path')
const fs = require('fs')
const serverlessExpress = require('../src/index')
const app = require('../examples/basic-starter-api-gateway-v1/src/app')
const { log, makeEvent, expectedRootResponse, makeResponse, EACH_MATRIX } = require('../jest-helpers')

const serverlessExpressInstance = serverlessExpress({ app, log })

describe.each(EACH_MATRIX)('%s:%s: integration tests', (eventSourceName, frameworkName) => {
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
    const event = makeEvent({
      eventSourceName,
      path: '/',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)

    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = expectedRootResponse()
    delete response.body
    delete expectedResponse.body
    delete response.multiValueHeaders.date
    expect(response).toEqual(expectedResponse)
  })

  test('GET JSON collection', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)

    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '[{"id":1,"name":"Joe"},{"id":2,"name":"Jane"}]',
      multiValueHeaders: {
        'content-length': ['46'],
        etag: ['W/"2e-Lu6qxFOQSPFulDAGUFiiK6QgREo"']
      }
    }))
  })

  test('GET missing route', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/nothing-here',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)

    delete response.multiValueHeaders.date
    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = makeResponse({
      multiValueHeaders: {
        'content-length': [151],
        'content-security-policy': ["default-src 'none'"],
        'content-type': ['text/html; charset=utf-8'],
        'x-content-type-options': ['nosniff']
      },
      statusCode: 404
    })
    delete response.body
    delete expectedResponse.body
    expect(response).toEqual(expectedResponse)
  })

  test('GET JSON single', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/1',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)

    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":1,"name":"Joe"}',
      multiValueHeaders: {
        'content-length': ['21'],
        etag: ['W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"']
      }
    }))
  })

  test('GET JSON single (resolutionMode = CALLBACK)', (done) => {
    const callback = (e, response) => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        body: '{"id":1,"name":"Joe"}',
        multiValueHeaders: {
          'content-length': ['21'],
          etag: ['W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"']
        }
      }))
      done()
    }

    const event = makeEvent({
      eventSourceName,
      path: '/users/1',
      httpMethod: 'GET'
    })
    const serverlessExpressInstanceWithCallbackResolutionMode = serverlessExpress({ app, log, resolutionMode: 'CALLBACK' })
    serverlessExpressInstanceWithCallbackResolutionMode.handler(event, {}, callback)
  })

  test('GET JSON single (resolutionMode = PROMISE)', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/1',
      httpMethod: 'GET'
    })
    const serverlessExpressInstanceWithPromiseResolutionMode = serverlessExpress({ app, log, resolutionMode: 'PROMISE' })
    const response = await serverlessExpressInstanceWithPromiseResolutionMode.handler(event)

    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":1,"name":"Joe"}',
      multiValueHeaders: {
        'content-length': ['21'],
        etag: ['W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"']
      }
    }))
  })

  test('GET JSON single 404', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/3',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{}',
      multiValueHeaders: {
        'content-length': ['2'],
        etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
      },
      statusCode: 404
    }))
  })

  test('success - image response', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/sam',
      httpMethod: 'GET'
    })

    const serverlessExpressInstanceWithBinaryMimeTypes = serverlessExpress({ app, log, binaryMimeTypes: ['image/*'] })
    const response = await serverlessExpressInstanceWithBinaryMimeTypes.handler(event)
    delete response.multiValueHeaders.date
    delete response.multiValueHeaders.etag
    delete response.multiValueHeaders['last-modified']

    const samLogoPath = path.resolve(path.join(__dirname, '../examples/basic-starter-api-gateway-v1/src/sam-logo.png'))
    const samLogoImage = fs.readFileSync(samLogoPath)
    const samLogoBase64 = Buffer.from(samLogoImage).toString('base64')

    expect(response).toEqual(makeResponse({
      body: samLogoBase64,
      multiValueHeaders: {
        'accept-ranges': ['bytes'],
        'cache-control': ['public, max-age=0'],
        'content-length': [15933],
        'content-type': ['image/png']
      },
      isBase64Encoded: true
    }))
  })
  const newName = 'Sandy Samantha Salamander'

  test('POST JSON', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users',
      httpMethod: 'POST',
      body: `{"name": "${newName}"}`
    })
    const response = await serverlessExpressInstance.handler(event)

    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: `{"id":3,"name":"${newName}"}`,
      multiValueHeaders: {
        'content-length': ['43'],
        etag: ['W/"2b-ksYHypm1DmDdjEzhtyiv73Bluqk"']
      },
      statusCode: 201
    }))
  })

  test('GET JSON single (again; post-creation) 200', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/3',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: `{"id":3,"name":"${newName}"}`,
      multiValueHeaders: {
        'content-length': ['43'],
        etag: ['W/"2b-ksYHypm1DmDdjEzhtyiv73Bluqk"']
      },
      statusCode: 200
    }))
  })

  test('DELETE JSON', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/1',
      httpMethod: 'DELETE'
    })
    const response = await serverlessExpressInstance.handler(event)

    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: `[{"id":2,"name":"Jane"},{"id":3,"name":"${newName}"}]`,
      multiValueHeaders: {
        'content-length': ['68'],
        etag: ['W/"44-AtuxlvrIBL8NXP4gvEQTI77suNg"']
      },
      statusCode: 200
    }))
  })

  test('PUT JSON', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/2',
      httpMethod: 'PUT',
      body: '{"name": "Samuel"}'
    })
    const response = await serverlessExpressInstance.handler(event)
    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":2,"name":"Samuel"}',
      multiValueHeaders: {
        'content-length': ['24'],
        etag: ['W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"']
      },
      statusCode: 200
    }))
  })

  test('base64 encoded request', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/users/2',
      httpMethod: 'PUT',
      body: global.btoa('{"name": "Samuel"}'),
      isBase64Encoded: true
    })
    const response = await serverlessExpressInstance.handler(event)
    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":2,"name":"Samuel"}',
      multiValueHeaders: {
        'access-control-allow-origin': [
          '*'
        ],
        'content-length': [
          '24'
        ],
        'content-type': [
          'application/json; charset=utf-8'
        ],
        etag: [
          'W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"'
        ],
        'x-powered-by': [
          'Express'
        ]
      },
      statusCode: 200
    }))
  })

  test.skip('respondToEventSourceWithError', async () => {
    const response = await serverlessExpressInstance.handler(null)
    expect(response).toEqual({
      statusCode: 500,
      body: '',
      multiValueHeaders: {}
    })
  })

  test('Multiple headers of the same name (set-cookie)', async () => {
    const event = makeEvent({
      eventSourceName,
      path: '/cookie',
      httpMethod: 'GET'
    })
    const response = await serverlessExpressInstance.handler(event)
    delete response.multiValueHeaders.date

    const expectedSetCookieHeaders = [
      'Foo=bar; Path=/',
      'Fizz=buzz; Path=/'
    ]
    expect(response).toEqual(makeResponse({
      body: '{}',
      multiValueHeaders: {
        'set-cookie': expectedSetCookieHeaders,
        'content-length': ['2'],
        etag: ['W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"']
      },
      statusCode: 200
    }))
  })
})

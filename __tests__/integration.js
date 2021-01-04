const path = require('path')
const fs = require('fs')
const vendiaServerlessExpress = require('../index')
const apiGatewayEvent = require('../examples/basic-starter/api-gateway-event.json')
const app = require('../examples/basic-starter/src/app')

const serverlessExpress = vendiaServerlessExpress.configure({ app })
const server = serverlessExpress.server
const nodeMajorVersion = process.version.split('.')[0].split('v')[1]

function clone (json) {
  return JSON.parse(JSON.stringify(json))
}

function makeEvent (eventOverrides = {}) {
  const baseEvent = clone(apiGatewayEvent)
  const multiValueHeaders = {
    ...baseEvent.multiValueHeaders,
    ...eventOverrides.multiValueHeaders
  }
  const root = {
    ...baseEvent,
    ...eventOverrides
  }
  root.multiValueHeaders = multiValueHeaders
  root.pathParameters.proxy = eventOverrides.path && eventOverrides.path.replace(/^\//, '')
  return root
}

function expectedRootResponse () {
  return makeResponse({
    multiValueHeaders: {
      'content-length': ['3728'],
      'content-type': ['text/html; charset=utf-8'],
      etag: ['W/"e90-ToQlyXvAkG0PJrs7lZqgVr+CrkI"']
    }
  })
}

function makeResponse (response) {
  const baseResponse = {
    body: '',
    isBase64Encoded: false,
    statusCode: 200
  }
  const baseHeaders = {
    'access-control-allow-origin': ['*'],
    connection: ['close'],
    'content-type': ['application/json; charset=utf-8'],
    'x-powered-by': ['Express']
  }
  const multiValueHeaders = {
    ...baseHeaders,
    ...response.multiValueHeaders
  }
  const finalResponse = {
    ...baseResponse,
    ...response
  }
  finalResponse.multiValueHeaders = multiValueHeaders
  return finalResponse
}

describe('integration tests', () => {
  test('proxy returns promise', () => {
    const response = serverlessExpress.handler(makeEvent({
      path: '/',
      httpMethod: 'GET'
    }))
    expect(response.then).toBeTruthy()
  })

  test('GET HTML (initial request)', async () => {
    const response = await serverlessExpress.handler(makeEvent({ path: '/', httpMethod: 'GET' }))

    delete response.multiValueHeaders.date
    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = expectedRootResponse()
    delete response.body
    delete expectedResponse.body
    expect(response).toEqual(expectedResponse)
  })

  test('GET HTML (subsequent request)', async () => {
    const response = await serverlessExpress.handler(makeEvent({
      path: '/',
      httpMethod: 'GET'
    }))
    delete response.multiValueHeaders.date
    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = expectedRootResponse()
    delete response.body
    delete expectedResponse.body
    expect(response).toEqual(expectedResponse)
  })

  test('GET JSON collection', async () => {
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users',
      httpMethod: 'GET'
    }))

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
    const response = await serverlessExpress.handler(makeEvent({
      path: '/nothing-here',
      httpMethod: 'GET'
    }))

    delete response.multiValueHeaders.date
    expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
    const expectedResponse = makeResponse({
      multiValueHeaders: {
        'content-length': ['151'],
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
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    }))

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
    serverlessExpress.proxy({
      event: makeEvent({
        path: '/users/1',
        httpMethod: 'GET'
      }),
      resolutionMode: 'CALLBACK',
      callback
    })
  })

  test('GET JSON single (resolutionMode = PROMISE)', async () => {
    const response = await serverlessExpress.proxy({
      event: makeEvent({
        path: '/users/1',
        httpMethod: 'GET'
      }),
      resolutionMode: 'PROMISE'
    })

    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":1,"name":"Joe"}',
      multiValueHeaders: {
        'content-length': ['21'],
        etag: ['W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"']
      }
    }))
  })

  test('GET JSON single (resolutionMode = PROMISE; new server)', async () => {
    const newServererlessExpress = vendiaServerlessExpress.configure({ app, resolutionMode: 'PROMISE' })
    const event = makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    })
    const response = await newServererlessExpress.handler(event)
    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":1,"name":"Joe"}',
      multiValueHeaders: {
        'content-length': ['21'],
        etag: ['W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"']
      }
    }))
    newServererlessExpress.server.close()
  })

  test('GET JSON single 404', async () => {
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users/3',
      httpMethod: 'GET'
    }))
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
    const serverWithBinaryTypes = serverlessExpress.createServer({
      app,
      binaryMimeTypes: ['image/*']
    })
    const event = makeEvent({
      path: '/sam',
      httpMethod: 'GET'
    })
    const response = await serverlessExpress.proxy({
      server: serverWithBinaryTypes,
      event
    })
    delete response.multiValueHeaders.date
    delete response.multiValueHeaders.etag
    delete response.multiValueHeaders['last-modified']

    const samLogoPath = path.resolve(path.join(__dirname, '../examples/basic-starter/src/sam-logo.png'))
    const samLogoImage = fs.readFileSync(samLogoPath)
    const samLogoBase64 = Buffer.from(samLogoImage).toString('base64')

    expect(response).toEqual(makeResponse({
      body: samLogoBase64,
      multiValueHeaders: {
        'accept-ranges': ['bytes'],
        'cache-control': ['public, max-age=0'],
        'content-length': ['15933'],
        'content-type': ['image/png']
      },
      isBase64Encoded: true
    }))
    serverWithBinaryTypes.close()
  })
  const newName = 'Sandy Samantha Salamander'

  test('POST JSON', async () => {
    const event = makeEvent({
      path: '/users',
      httpMethod: 'POST',
      body: `{"name": "${newName}"}`
    })
    const response = await serverlessExpress.handler(event)

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
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users/3',
      httpMethod: 'GET'
    }))
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
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'DELETE'
    }))

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
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: '{"name": "Samuel"}'
    }))
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
    const response = await serverlessExpress.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: global.btoa('{"name": "Samuel"}'),
      isBase64Encoded: true
    }))
    delete response.multiValueHeaders.date
    expect(response).toEqual(makeResponse({
      body: '{"id":2,"name":"Samuel"}',
      multiValueHeaders: {
        'access-control-allow-origin': [
          '*'
        ],
        connection: [
          'close'
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

  // TODO: This test is failing on Node.js 10 as this isn't forcing a connection error like earlier versions of Node do.
  // Need to determine a new way of forcing a connection error which works in both 8 and 10 before re-enabling this.
  // For now, we still have a unit test for forwardConnectionErrorResponseToApiGateway.
  test.skip('forwardConnectionErrorResponseToApiGateway', async () => {
    const response = await serverlessExpress.handler(makeEvent({
      path: '/',
      httpMethod: 'GET',
      body: '{"name": "Sam502"}',
      multiValueHeaders: {
        'Content-Length': ['-1']
      }
    }))
    delete response.multiValueHeaders.date
    expect(response).toEqual({
      body: '',
      multiValueHeaders: {},
      statusCode: 502
    })
  })

  const mockApp = function (req, res) {
    res.end('')
  }

  test.skip('forwardLibraryErrorResponseToApiGateway', async () => {
    const response = await serverlessExpress.handler(null)
    expect(response).toEqual({
      statusCode: 500,
      body: '',
      multiValueHeaders: {}
    })
  })

  test('serverListenCallback', async () => {
    const serverListenCallback = jest.fn()
    const serverWithListenCallback = serverlessExpress.createServer({
      app: mockApp
    })
    serverWithListenCallback.on('listening', serverListenCallback)

    const response = await serverlessExpress.proxy({
      server: serverWithListenCallback,
      event: makeEvent()
    })

    expect(response.statusCode).toBe(200)
    expect(serverListenCallback).toHaveBeenCalled()
    serverWithListenCallback.close()
  })

  test('Multiple headers of the same name (set-cookie)', async () => {
    const response = await serverlessExpress.handler(makeEvent({
      path: '/cookie',
      httpMethod: 'GET'
    }))
    delete response.multiValueHeaders.date

    const expectedSetCookieHeaders = nodeMajorVersion >= 10 ? [
      'Foo=bar; Path=/',
      'Fizz=buzz; Path=/'
    ] : ['Foo=bar; Path=/,Fizz=buzz; Path=/']
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

  // NOTE: These must remain as the final tests as the EADDRINUSE test breaks
  // the main `server` used by tests since the socket is deleted
  // and the server.onClose also closes `server`
  test('server.onError EADDRINUSE', async () => {
    const serverWithSameSocketPath = serverlessExpress.createServer({ app: mockApp })
    serverWithSameSocketPath._serverlessExpress.socketPath = server._serverlessExpress.socketPath

    const response = await serverlessExpress.proxy({
      server: serverWithSameSocketPath,
      event: makeEvent()
    })
    expect(response.statusCode).toBe(200)
    expect(serverWithSameSocketPath._serverlessExpress.socketPath).not.toBe(server._serverlessExpress.socketPath)
    serverWithSameSocketPath.close()
  })

  test('server.onClose', async () => {
    server.on('close', () => {
      expect(server.listening).toBe(false)
    })
    server.close()
  })
})

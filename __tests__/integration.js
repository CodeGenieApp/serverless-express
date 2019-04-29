const path = require('path')
const fs = require('fs')
const awsServerlessExpress = require('../index')
const apiGatewayEvent = require('../examples/basic-starter/api-gateway-event.json')
const app = require('../examples/basic-starter/app')

const serverlessExpress = awsServerlessExpress.configure({ app })
const server = serverlessExpress.server

function clone (json) {
  return JSON.parse(JSON.stringify(json))
}

function makeEvent (eventOverrides) {
  const baseEvent = clone(apiGatewayEvent)
  const multiValueHeaders = Object.assign({}, baseEvent.multiValueHeaders, eventOverrides.multiValueHeaders)
  const root = Object.assign({}, baseEvent, eventOverrides)
  root.multiValueHeaders = multiValueHeaders
  return root
}

function expectedRootResponse () {
  return makeResponse({
    'multiValueHeaders': {
      'content-length': '3747',
      'content-type': 'text/html; charset=utf-8',
      'etag': 'W/"ea3-WawLnWdlaCO/ODv9DBVcX0ZTchw"'
    }
  })
}

function makeResponse (response) {
  const baseResponse = {
    'body': '',
    'isBase64Encoded': false,
    'statusCode': 200
  }
  const baseHeaders = {
    'access-control-allow-origin': '*',
    'connection': 'close',
    'content-type': 'application/json; charset=utf-8',
    'x-powered-by': 'Express'
  }
  const multiValueHeaders = Object.assign({}, baseHeaders, response.multiValueHeaders)
  const finalResponse = Object.assign({}, baseResponse, response)
  finalResponse.multiValueHeaders = multiValueHeaders
  return finalResponse
}

describe('integration tests', () => {
  test('proxy returns object', (done) => {
    const succeed = () => {
      done()
    }

    const response = serverlessExpress.handler(makeEvent({
      path: '/',
      httpMethod: 'GET'
    }), {
      succeed
    })
    expect(response.promise.then).toBeTruthy()
  })

  test('GET HTML (initial request)', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
      const expectedResponse = expectedRootResponse()
      delete response.body
      delete expectedResponse.body
      expect(response).toEqual(expectedResponse)
      done()
    }
    serverlessExpress.handler(makeEvent({ path: '/', httpMethod: 'GET' }), {
      succeed
    })
  })

  test('GET HTML (subsequent request)', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
      const expectedResponse = expectedRootResponse()
      delete response.body
      delete expectedResponse.body
      expect(response).toEqual(expectedResponse)
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET JSON collection', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '[{"id":1,"name":"Joe"},{"id":2,"name":"Jane"}]',
        'multiValueHeaders': {
          'content-length': '46',
          'etag': 'W/"2e-Lu6qxFOQSPFulDAGUFiiK6QgREo"'
        }
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET missing route', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
      const expectedResponse = makeResponse({
        'multiValueHeaders': {
          'content-length': '151',
          'content-security-policy': "default-src 'self'",
          'content-type': 'text/html; charset=utf-8',
          'x-content-type-options': 'nosniff'
        },
        statusCode: 404
      })
      delete response.body
      delete expectedResponse.body
      expect(response).toEqual(expectedResponse)
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/nothing-here',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET JSON single', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'multiValueHeaders': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET JSON single (resolutionMode = CALLBACK)', (done) => {
    const callback = (e, response) => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'multiValueHeaders': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
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

  test('GET JSON single (resolutionMode = PROMISE)', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'multiValueHeaders': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      done()
    }
    serverlessExpress.proxy({
      event: makeEvent({
        path: '/users/1',
        httpMethod: 'GET'
      }),
      resolutionMode: 'PROMISE'
    })
      .promise.then(succeed)
  })

  test('GET JSON single (resolutionMode = PROMISE; new server)', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'multiValueHeaders': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      newServererlessExpress.server.close()
      done()
    }
    const newServererlessExpress = awsServerlessExpress.configure({ app, resolutionMode: 'PROMISE' })
    const event = makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    })
    newServererlessExpress.handler(event).promise.then(succeed)
  })

  test('GET JSON single 404', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{}',
        'multiValueHeaders': {
          'content-length': '2',
          'etag': 'W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"'
        },
        statusCode: 404
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users/3',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('success - image response', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      delete response.multiValueHeaders.etag
      delete response.multiValueHeaders['last-modified']

      const samLogoPath = path.resolve(path.join(__dirname, '../examples/basic-starter/sam-logo.png'))
      const samLogoImage = fs.readFileSync(samLogoPath)
      const samLogoBase64 = Buffer.from(samLogoImage).toString('base64')

      expect(response).toEqual(makeResponse({
        'body': samLogoBase64,
        'multiValueHeaders': {
          'accept-ranges': 'bytes',
          'cache-control': 'public, max-age=0',
          'content-length': '15933',
          'content-type': 'image/png'
        },
        'isBase64Encoded': true
      }))
      serverWithBinaryTypes.close()
      done()
    }
    const serverWithBinaryTypes = serverlessExpress.createServer({
      app,
      binaryMimeTypes: ['image/*']
    })
    const event = makeEvent({
      path: '/sam',
      httpMethod: 'GET'
    })
    serverlessExpress.proxy({
      server: serverWithBinaryTypes,
      event,
      context: {
        succeed
      }
    })
  })
  const newName = 'Sandy Samantha Salamander'

  test('POST JSON', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': `{"id":3,"name":"${newName}"}`,
        'multiValueHeaders': {
          'content-length': '43',
          'etag': 'W/"2b-ksYHypm1DmDdjEzhtyiv73Bluqk"'
        },
        statusCode: 201
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users',
      httpMethod: 'POST',
      body: `{"name": "${newName}"}`
    }), {
      succeed
    })
  })

  test('GET JSON single (again; post-creation) 200', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': `{"id":3,"name":"${newName}"}`,
        'multiValueHeaders': {
          'content-length': '43',
          'etag': 'W/"2b-ksYHypm1DmDdjEzhtyiv73Bluqk"'
        },
        statusCode: 200
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users/3',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('DELETE JSON', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': `[{"id":2,"name":"Jane"},{"id":3,"name":"${newName}"}]`,
        'multiValueHeaders': {
          'content-length': '68',
          'etag': 'W/"44-AtuxlvrIBL8NXP4gvEQTI77suNg"'
        },
        statusCode: 200
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'DELETE'
    }), {
      succeed
    })
  })

  test('PUT JSON', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":2,"name":"Samuel"}',
        'multiValueHeaders': {
          'content-length': '24',
          'etag': 'W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"'
        },
        statusCode: 200
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: '{"name": "Samuel"}'
    }), {
      succeed
    })
  })

  test('base64 encoded request', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":2,"name":"Samuel"}',
        'multiValueHeaders': {
          'content-length': '24',
          'etag': 'W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"'
        },
        statusCode: 200
      }))
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: global.btoa('{"name": "Samuel"}'),
      isBase64Encoded: true
    }), {
      succeed
    })
  })

  // TODO: This test is failing on Node.js 10 as this isn't forcing a connection error like earlier versions of Node do.
  // Need to determine a new way of forcing a connection error which works in both 8 and 10 before re-enabling this.
  // For now, we still have a unit test for forwardConnectionErrorResponseToApiGateway.
  test.skip('forwardConnectionErrorResponseToApiGateway', (done) => {
    const succeed = response => {
      delete response.multiValueHeaders.date
      expect(response).toEqual({
        'body': '',
        'multiValueHeaders': {},
        statusCode: 502
      })
      done()
    }
    serverlessExpress.handler(makeEvent({
      path: '/',
      httpMethod: 'GET',
      body: '{"name": "Sam502"}',
      multiValueHeaders: {
        'Content-Length': '-1'
      }
    }), {
      succeed
    })
  })

  const mockApp = function (req, res) {
    res.end('')
  }

  test.skip('forwardLibraryErrorResponseToApiGateway', (done) => {
    const succeed = response => {
      expect(response).toEqual({
        statusCode: 500,
        body: '',
        multiValueHeaders: {}
      })
      done()
    }
    serverlessExpress.handler(null, { succeed })
  })

  test('serverListenCallback', (done) => {
    const serverListenCallback = jest.fn()
    const serverWithListenCallback = serverlessExpress.createServer({
      app: mockApp
    })
    serverWithListenCallback.on('listening', serverListenCallback)
    const succeed = response => {
      expect(response.statusCode).toBe(200)
      expect(serverListenCallback).toHaveBeenCalled()
      serverWithListenCallback.close()
      done()
    }
    serverlessExpress.proxy({
      server: serverWithListenCallback,
      event: makeEvent({}),
      context: {
        succeed
      }})
  })

  test('server.onError EADDRINUSE', (done) => {
    const serverWithSameSocketPath = serverlessExpress.createServer({ app: mockApp })
    serverWithSameSocketPath._socketPathSuffix = server._socketPathSuffix
    const succeed = response => {
      expect(response.statusCode).toBe(200)
      done()
      serverWithSameSocketPath.close()
    }
    serverlessExpress.proxy({
      server: serverWithSameSocketPath,
      event: makeEvent({}),
      context: {
        succeed
      }
    })
  })

  test.todo('set-cookie')

  test('server.onClose', (done) => {
    // NOTE: this must remain as the final test as it closes `server`
    const succeed = response => {
      server.on('close', () => {
        expect(server.listening).toBe(false)
        done()
      })
      server.close()
    }

    serverlessExpress.handler(makeEvent({}), {
      succeed
    })
  })
})

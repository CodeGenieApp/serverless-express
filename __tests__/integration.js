const path = require('path')
const fs = require('fs')
const awsServerlessExpress = require('../index')
const apiGatewayEvent = require('../examples/basic-starter/api-gateway-event.json')
const app = require('../examples/basic-starter/app')

const server = awsServerlessExpress.createServer(app)
const lambdaFunction = {
  handler: (event, context, resolutionMode, callback, _server) => awsServerlessExpress.proxy(_server || server, event, context, resolutionMode, callback)
}

function clone (json) {
  return JSON.parse(JSON.stringify(json))
}

function makeEvent (eventOverrides) {
  const baseEvent = clone(apiGatewayEvent)
  const headers = Object.assign({}, baseEvent.headers, eventOverrides.headers)
  const root = Object.assign({}, baseEvent, eventOverrides)
  root.headers = headers
  return root
}

function expectedRootResponse () {
  return makeResponse({
    'headers': {
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
  const headers = Object.assign({}, baseHeaders, response.headers)
  const finalResponse = Object.assign({}, baseResponse, response)
  finalResponse.headers = headers
  return finalResponse
}

describe('integration tests', () => {
  test('proxy returns server', (done) => {
    const succeed = () => {
      done()
    }

    const server = lambdaFunction.handler(makeEvent({
      path: '/',
      httpMethod: 'GET'
    }), {
      succeed
    })
    expect(server._socketPathSuffix).toBeTruthy()
  })

  test('GET HTML (initial request)', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
      const expectedResponse = expectedRootResponse()
      delete response.body
      delete expectedResponse.body
      expect(response).toEqual(expectedResponse)
      done()
    }
    lambdaFunction.handler(makeEvent({ path: '/', httpMethod: 'GET' }), {
      succeed
    })
  })

  test('GET HTML (subsequent request)', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
      const expectedResponse = expectedRootResponse()
      delete response.body
      delete expectedResponse.body
      expect(response).toEqual(expectedResponse)
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET JSON collection', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '[{"id":1,"name":"Joe"},{"id":2,"name":"Jane"}]',
        'headers': {
          'content-length': '46',
          'etag': 'W/"2e-Lu6qxFOQSPFulDAGUFiiK6QgREo"'
        }
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET missing route', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response.body.startsWith('<!DOCTYPE html>')).toBe(true)
      const expectedResponse = makeResponse({
        'headers': {
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
    lambdaFunction.handler(makeEvent({
      path: '/nothing-here',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET JSON single', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'headers': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('GET JSON single (resolutionMode = CALLBACK)', (done) => {
    const callback = (e, response) => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'headers': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    }), {}, 'CALLBACK', callback)
  })

  test('GET JSON single (resolutionMode = PROMISE)', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'headers': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    }), {}, 'PROMISE')
      .promise.then(succeed)
  })

  test('GET JSON single (resolutionMode = PROMISE; new server)', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":1,"name":"Joe"}',
        'headers': {
          'content-length': '21',
          'etag': 'W/"15-rRboW+j/yFKqYqV6yklp53+fANQ"'
        }
      }))
      newServer.close()
      done()
    }
    const newServer = awsServerlessExpress.createServer(app)
    lambdaFunction.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'GET'
    }), {}, 'PROMISE', null, newServer)
      .promise.then(succeed)
  })

  test('GET JSON single 404', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{}',
        'headers': {
          'content-length': '2',
          'etag': 'W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"'
        },
        statusCode: 404
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/3',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('success - image response', (done) => {
    const succeed = response => {
      delete response.headers.date
      delete response.headers.etag
      delete response.headers['last-modified']

      const samLogoPath = path.resolve(path.join(__dirname, '../examples/basic-starter/sam-logo.png'))
      const samLogoImage = fs.readFileSync(samLogoPath)
      const samLogoBase64 = Buffer.from(samLogoImage).toString('base64')

      expect(response).toEqual(makeResponse({
        'body': samLogoBase64,
        'headers': {
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
    const serverWithBinaryTypes = awsServerlessExpress.createServer(app, null, ['image/*'])
    awsServerlessExpress.proxy(serverWithBinaryTypes, makeEvent({
      path: '/sam',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })
  const newName = 'Sandy Samantha Salamander'

  test('POST JSON', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': `{"id":3,"name":"${newName}"}`,
        'headers': {
          'content-length': '43',
          'etag': 'W/"2b-ksYHypm1DmDdjEzhtyiv73Bluqk"'
        },
        statusCode: 201
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users',
      httpMethod: 'POST',
      body: `{"name": "${newName}"}`
    }), {
      succeed
    })
  })

  test('GET JSON single (again; post-creation) 200', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': `{"id":3,"name":"${newName}"}`,
        'headers': {
          'content-length': '43',
          'etag': 'W/"2b-ksYHypm1DmDdjEzhtyiv73Bluqk"'
        },
        statusCode: 200
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/3',
      httpMethod: 'GET'
    }), {
      succeed
    })
  })

  test('DELETE JSON', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': `[{"id":2,"name":"Jane"},{"id":3,"name":"${newName}"}]`,
        'headers': {
          'content-length': '68',
          'etag': 'W/"44-AtuxlvrIBL8NXP4gvEQTI77suNg"'
        },
        statusCode: 200
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/1',
      httpMethod: 'DELETE'
    }), {
      succeed
    })
  })

  test('PUT JSON', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":2,"name":"Samuel"}',
        'headers': {
          'content-length': '24',
          'etag': 'W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"'
        },
        statusCode: 200
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: '{"name": "Samuel"}'
    }), {
      succeed
    })
  })

  test('base64 encoded request', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        'body': '{"id":2,"name":"Samuel"}',
        'headers': {
          'content-length': '24',
          'etag': 'W/"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q"'
        },
        statusCode: 200
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: global.btoa('{"name": "Samuel"}'),
      isBase64Encoded: true
    }), {
      succeed
    })
  })

  // [TODO] The behavior of Node in versions >10 has changed an the error is no longer thrown
  // in this case to trigger the 502 response. The unit tests still check the correct
  // structure of the 502 response and we'll need to find a new way to test an express
  // failure
  test.skip('forwardConnectionErrorResponseToApiGateway', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual({
        'body': '',
        'headers': {},
        statusCode: 502
      })
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/',
      httpMethod: 'GET',
      body: '{"name": "Sam502"}',
      headers: {
        'Content-Length': '-1'
      }
    }), {
      succeed
    })
  })

  const mockApp = function (req, res) {
    res.end('')
  }

  test('forwardLibraryErrorResponseToApiGateway', (done) => {
    const succeed = response => {
      expect(response).toEqual({
        statusCode: 500,
        body: '',
        headers: {}
      })
      done()
    }
    awsServerlessExpress.proxy(server, null, {
      succeed
    })
  })

  test('serverListenCallback', (done) => {
    const serverListenCallback = jest.fn()
    const serverWithCallback = awsServerlessExpress.createServer(mockApp, serverListenCallback)
    const succeed = response => {
      expect(response.statusCode).toBe(200)
      expect(serverListenCallback).toHaveBeenCalled()
      serverWithCallback.close()
      done()
    }
    awsServerlessExpress.proxy(serverWithCallback, makeEvent({}), {
      succeed
    })
  })

  test('server.onError EADDRINUSE', (done) => {
    const serverWithSameSocketPath = awsServerlessExpress.createServer(mockApp)
    serverWithSameSocketPath._socketPathSuffix = server._socketPathSuffix
    const succeed = response => {
      expect(response.statusCode).toBe(200)
      done()
      serverWithSameSocketPath.close()
    }
    awsServerlessExpress.proxy(serverWithSameSocketPath, makeEvent({}), {
      succeed
    })
  })

  test.todo('set-cookie')

  test('server.onClose', (done) => {
    // NOTE: this must remain as the final test as it closes `server`
    const succeed = response => {
      server.on('close', () => {
        expect(server._isListening).toBe(false)
        done()
      })
      server.close()
    }
    const server = lambdaFunction.handler(makeEvent({}), {
      succeed
    })
  })
})

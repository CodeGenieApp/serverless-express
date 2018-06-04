const awsServerlessExpress = require('../index')
const apiGatewayEvent = require('../example/api-gateway-event.json')
const app = require('../example/app')

const server = awsServerlessExpress.createServer(app)
const lambdaFunction = {
  handler: (event, context) => awsServerlessExpress.proxy(server, event, context)
}

function clone(json) {
  return JSON.parse(JSON.stringify(json))
}

function makeEvent(eventOverrides) {
  const baseEvent = clone(apiGatewayEvent)
  const headers = Object.assign({}, baseEvent.headers, eventOverrides.headers)
  delete eventOverrides.headers
  const root = Object.assign({}, baseEvent, eventOverrides)
  root.headers = headers
  return root
}

function expectedRootResponse() {
  return makeResponse({
    "headers": {
      "content-length": "3747",
      "content-type": "text/html; charset=utf-8",
      "etag": "W/\"ea3-WawLnWdlaCO/ODv9DBVcX0ZTchw\""
    }
  })
}

function makeResponse(response) {
  const baseResponse = {
    "body": "",
    "isBase64Encoded": false,
    "statusCode": 200
  }
  const baseHeaders = {
    "access-control-allow-origin": "*",
    "connection": "close",
    "content-type": "application/json; charset=utf-8",
    "x-powered-by": "Express"
  }
  const headers = Object.assign({}, baseHeaders, response.headers)
  const finalResponse = Object.assign({}, baseResponse, response)
  finalResponse.headers = headers
  return finalResponse
}

describe('integration tests', () => {
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
        "body": '[{"id":1,"name":"Joe"},{"id":2,"name":"Jane"}]',
        "headers": {
          "content-length": "46",
          "etag": "W/\"2e-Lu6qxFOQSPFulDAGUFiiK6QgREo\"",
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
        "headers": {
          "content-length": "151",
          "content-security-policy": "default-src \'self\'",
          "content-type": "text/html; charset=utf-8",
          "x-content-type-options": "nosniff",
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
        "body": '{"id":1,"name":"Joe"}',
        "headers": {
          "content-length": "21",
          "etag": "W/\"15-rRboW+j/yFKqYqV6yklp53+fANQ\"",
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

  test('GET JSON single 404', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual(makeResponse({
        "body": "{}",
        "headers": {
          "content-length": "2",
          "etag": "W/\"2-vyGp6PvFo4RvsFtPoIWeCReyIC8\"",
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
      expect(response).toEqual(makeResponse({
        "body": "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",
        "headers": {
          "accept-ranges": "bytes",
          "cache-control": "public, max-age=0",
          "content-length": "15933",
          "content-type": "image/png"
        },
        "isBase64Encoded": true
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
        "body": `{"id":3,"name":"${newName}"}`,
        "headers": {
          "content-length": "43",
          "etag": "W/\"2b-ksYHypm1DmDdjEzhtyiv73Bluqk\"",
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
        "body": `{"id":3,"name":"${newName}"}`,
        "headers": {
          "content-length": "43",
          "etag": "W/\"2b-ksYHypm1DmDdjEzhtyiv73Bluqk\"",
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
        "body": `[{"id":2,"name":"Jane"},{"id":3,"name":"${newName}"}]`,
        "headers": {
          "content-length": "68",
          "etag": "W/\"44-AtuxlvrIBL8NXP4gvEQTI77suNg\"",
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
        "body": '{"id":2,"name":"Samuel"}',
        "headers": {
          "content-length": "24",
          "etag": "W/\"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q\"",
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
        "body": '{"id":2,"name":"Samuel"}',
        "headers": {
          "content-length": "24",
          "etag": "W/\"18-uGyzhJdtXqacOe9WRxtXSNjIk5Q\"",
        },
        statusCode: 200
      }))
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/users/2',
      httpMethod: 'PUT',
      body: btoa('{"name": "Samuel"}'),
      isBase64Encoded: true
    }), {
      succeed
    })
  })

  test('forwardConnectionErrorResponseToApiGateway', (done) => {
    const succeed = response => {
      delete response.headers.date
      expect(response).toEqual({
        "body": "",
        "headers": {},
        statusCode: 502
      })
      done()
    }
    lambdaFunction.handler(makeEvent({
      path: '/',
      httpMethod: 'GET',
      body: "{\"name\": \"Sam502\"}",
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

  test.skip('set-cookie')

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
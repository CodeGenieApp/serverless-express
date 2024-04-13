import 'regenerator-runtime/runtime'
import createEvent from '@serverless/event-mocks'
import { logger } from './utils/logger'
import { handler } from './lambda'

logger.level = 'error'

function makeContext() {
  return {
    awsRequestId: 'ef6e0ff0-4d67-11eb-87d2-3192f87a25ff',
  }
}

function createEventWithCognito(service, eventValues) {
  const event = createEvent(
    service,
    eventValues,
  )

  event.requestContext = {
    authorizer: {
      claims: {
        sub: 'userid123',
        email: 'user@example.com',
        'cognito:groups': '',
      },
    },
  }

  return event
}

describe('api: happy paths', () => {
  test('Get user', async () => {
    const context = makeContext()
    const path = 'users/existing-user'
    const event = createEventWithCognito(
      'aws:apiGateway',
      {
        path: `/${path}`,
        pathParameters: {
          proxy: path,
        },
      },
    )
    const response = await handler(event, context)
    expect(response).toMatchObject({
      body: JSON.stringify({ userId: 'existing-user', name: 'Existing user' }),
      isBase64Encoded: false,
      multiValueHeaders: {
        'access-control-allow-origin': ['*'],
        'content-length': ['70'],
        'content-type': ['application/json; charset=utf-8'],
        etag: ['W/"46-sJIzOhwjJFkevMddf52QxFC3kgc"'],
        'x-powered-by': ['Express'],
      },
      statusCode: 200,
    })
  }, 10000)
})

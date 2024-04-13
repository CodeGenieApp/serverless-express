import eventMocks from '@serverless/event-mocks'
import { handler } from './cognito-pre-token-generation'
import { createUser } from '../api/controllers/user'

jest.mock('../api/controllers/user')

describe('cognito-pre-token-generation: happy paths ', () => {
  test('Works', async () => {
    const userAttributes = {
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }
    const event = eventMocks('aws:cognitoUserPool', {
      request: {
        userAttributes,
      },
    })

    const handlerResponse = await handler(event)

    expect (createUser as jest.Mock).toHaveBeenCalledWith({
      user: {
        name: userAttributes.name,
        email: userAttributes.email,
      },
      userId: userAttributes.sub,
    })

    expect(handlerResponse).toMatchObject({
      request: { userAttributes },
    })
  })
})

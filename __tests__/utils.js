const { getEventSourceNameBasedOnEvent } = require('../src/event-sources/utils')

/**
This is an event delivered by `sam local start-api`,
using Type:HttpApi, with SAM CLI version 1.18.0.
*/
const samHttpApiEvent = {
  version: '2.0',
  routeKey: 'GET /',
  rawPath: '/',
  rawQueryString: '',
  cookies: [],
  headers: {
    Host: 'localhost:9000',
    'User-Agent': 'curl/7.64.1',
    Accept: '*/*',
    'X-Forwarded-Proto': 'http',
    'X-Forwarded-Port': '9000'
  },
  queryStringParameters: {},
  requestContext: {
    accountId: '123456789012',
    apiId: '1234567890',
    http: {
      method: 'GET',
      path: '/',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'Custom User Agent String'
    },
    requestId: 'aacf57f7-2fce-4069-a1f2-7cb4726dc028',
    routeKey: 'GET /',
    stage: null
  },
  body: '',
  pathParameters: {},
  stageVariables: null,
  isBase64Encoded: false
}

// Sample event from https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html
const dynamoDbEvent = {
  Records: [
    {
      eventID: '1',
      eventVersion: '1.0',
      dynamodb: {
        Keys: {
          Id: {
            N: '101'
          }
        },
        NewImage: {
          Message: {
            S: 'New item!'
          },
          Id: {
            N: '101'
          }
        },
        StreamViewType: 'NEW_AND_OLD_IMAGES',
        SequenceNumber: '111',
        SizeBytes: 26
      },
      awsRegion: 'us-west-2',
      eventName: 'INSERT',
      eventSourceARN: 'arn:aws:dynamodb:us-east-1:0000000000:mytable',
      eventSource: 'aws:dynamodb'
    },
    {
      eventID: '2',
      eventVersion: '1.0',
      dynamodb: {
        OldImage: {
          Message: {
            S: 'New item!'
          },
          Id: {
            N: '101'
          }
        },
        SequenceNumber: '222',
        Keys: {
          Id: {
            N: '101'
          }
        },
        SizeBytes: 59,
        NewImage: {
          Message: {
            S: 'This item has changed'
          },
          Id: {
            N: '101'
          }
        },
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      awsRegion: 'us-west-2',
      eventName: 'MODIFY',
      eventSourceARN: 'arn:aws:dynamodb:us-east-1:0000000000:mytable',
      eventSource: 'aws:dynamodb'
    }
  ]
}

// Sample event from https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html
const snsEvent = {
  Records: [
    {
      EventVersion: '1.0',
      EventSubscriptionArn:
        'arn:aws:sns:us-east-2:123456789012:sns-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
      EventSource: 'aws:sns',
      Sns: {
        SignatureVersion: '1',
        Timestamp: '2019-01-02T12:45:07.000Z',
        Signature: 'tcc6faL2yUC6dgZdmrwh1Y4cGa/ebXEkAi6RibDsvpi+tE/1+82j...65r==',
        SigningCertUrl:
          'https://sns.us-east-2.amazonaws.com/SimpleNotificationService-ac565b8b1a6c5d002d285f9598aa1d9b.pem',
        MessageId: '95df01b4-ee98-5cb9-9903-4c221d41eb5e',
        Message: 'Hello from SNS!',
        MessageAttributes: {
          Test: {
            Type: 'String',
            Value: 'TestString'
          },
          TestBinary: {
            Type: 'Binary',
            Value: 'TestBinary'
          }
        },
        Type: 'Notification',
        UnsubscribeUrl:
          'https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&amp;SubscriptionArn=arn:aws:sns:us-east-2:123456789012:test-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
        TopicArn: 'arn:aws:sns:us-east-2:123456789012:sns-lambda',
        Subject: 'TestInvoke'
      }
    }
  ]
}

describe('getEventSourceNameBasedOnEvent', () => {
  test('throws error on empty event', () => {
    expect(() => getEventSourceNameBasedOnEvent({ event: {} })).toThrow(
      'Unable to determine event source based on event.'
    )
  })

  test('recognizes sam local HttpApi event', () => {
    const result = getEventSourceNameBasedOnEvent({ event: samHttpApiEvent })
    expect(result).toEqual('AWS_API_GATEWAY_V2')
  })

  test('recognizes dynamodb event', () => {
    const result = getEventSourceNameBasedOnEvent({ event: dynamoDbEvent })
    expect(result).toEqual('AWS_DYNAMODB')
  })

  test('recognizes sns event', () => {
    const result = getEventSourceNameBasedOnEvent({ event: snsEvent })
    expect(result).toEqual('AWS_SNS')
  })
})

module.exports = {
  samHttpApiEvent,
  dynamoDbEvent,
  snsEvent
}

const clone = require('./clone')
const mergeDeep = require('./merge-deep')

const apiGatewayV1Event = {
  resource: '/{proxy+}',
  path: '/users',
  httpMethod: 'POST',
  headers: {
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'CloudFront-Forwarded-Proto': 'https',
    'CloudFront-Is-Desktop-Viewer': 'true',
    'CloudFront-Is-Mobile-Viewer': 'false',
    'CloudFront-Is-SmartTV-Viewer': 'false',
    'CloudFront-Is-Tablet-Viewer': 'false',
    'CloudFront-Viewer-Country': 'US',
    'content-type': '',
    Host: 'xxxxxx.execute-api.us-east-1.amazonaws.com',
    origin: 'https://xxxxxx.execute-api.us-east-1.amazonaws.com',
    pragma: 'no-cache',
    Referer: 'https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    Via: '2.0 00f0a41f749793b9dd653153037c957e.cloudfront.net (CloudFront)',
    'X-Amz-Cf-Id': '2D5N65SYHJdnJfEmAV_hC0Mw3QvkbUXDumJKAL786IGHRdq_MggPtA==',
    'X-Amzn-Trace-Id': 'Root=1-5cdf30d0-31a428004abe13807f9445b0',
    'X-Forwarded-For': '11.111.111.111, 11.111.111.111',
    'X-Forwarded-Port': '443',
    'X-Forwarded-Proto': 'https'
  },
  multiValueHeaders: {
    Accept: [
      '*/*'
    ],
    'Accept-Encoding': [
      'gzip, deflate, br'
    ],
    'Accept-Language': [
      'en-US,en;q=0.9'
    ],
    'cache-control': [
      'no-cache'
    ],
    'CloudFront-Forwarded-Proto': [
      'https'
    ],
    'CloudFront-Is-Desktop-Viewer': [
      'true'
    ],
    'CloudFront-Is-Mobile-Viewer': [
      'false'
    ],
    'CloudFront-Is-SmartTV-Viewer': [
      'false'
    ],
    'CloudFront-Is-Tablet-Viewer': [
      'false'
    ],
    'CloudFront-Viewer-Country': [
      'US'
    ],
    'content-type': [],
    Host: [
      'xxxxxx.execute-api.us-east-1.amazonaws.com'
    ],
    origin: [
      'https://xxxxxx.execute-api.us-east-1.amazonaws.com'
    ],
    pragma: [
      'no-cache'
    ],
    Referer: [
      'https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod/'
    ],
    'User-Agent': [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    ],
    Via: [
      '2.0 00f0a41f749793b9dd653153037c957e.cloudfront.net (CloudFront)'
    ],
    'X-Amz-Cf-Id': [
      '2D5N65SYHJdnJfEmAV_hC0Mw3QvkbUXDumJKAL786IGHRdq_MggPtA=='
    ],
    'X-Amzn-Trace-Id': [
      'Root=1-5cdf30d0-31a428004abe13807f9445b0'
    ],
    'X-Forwarded-For': [
      '11.111.111.111, 11.111.111.111'
    ],
    'X-Forwarded-Port': [
      '443'
    ],
    'X-Forwarded-Proto': [
      'https'
    ]
  },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: {
    // Default pathParameters.proxy to path (without the '/' prefix)
    // 'proxy': 'users'
  },
  stageVariables: {},
  requestContext: {
    resourceId: 'xxxxx',
    resourcePath: '/{proxy+}',
    httpMethod: 'POST',
    extendedRequestId: 'Z2SQlEORIAMFjpA=',
    requestTime: '17/May/2019:22:08:16 +0000',
    // Default requestContext.path to `${requestContext.stage}${path}`
    // 'path': '/prod/users',
    accountId: 'xxxxxxxx',
    protocol: 'HTTP/1.1',
    stage: 'prod',
    domainPrefix: 'xxxxxx',
    requestTimeEpoch: 1558130896565,
    requestId: '4589cf16-78f0-11e9-9c65-816a9b037cec',
    identity: {
      cognitoIdentityPoolId: null,
      accountId: null,
      cognitoIdentityId: null,
      caller: null,
      sourceIp: '11.111.111.111',
      principalOrgId: null,
      accessKey: null,
      cognitoAuthenticationType: null,
      cognitoAuthenticationProvider: null,
      userArn: null,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
      user: null
    },
    domainName: 'xxxxxx.execute-api.us-east-1.amazonaws.com',
    apiId: 'xxxxxx'
  },
  body: '',
  isBase64Encoded: false
}

function makeApiGatewayV1Event (values = {}) {
  const baseEvent = clone(apiGatewayV1Event)
  const mergedEvent = mergeDeep(baseEvent, values)

  if (!mergedEvent.pathParameters.proxy) mergedEvent.pathParameters.proxy = values.path.replace(/^\//, '')
  if (!mergedEvent.requestContext.path) mergedEvent.requestContext.path = `${mergedEvent.requestContext.stage}${mergedEvent.path}`

  return mergedEvent
}

function makeApiGatewayV1Response (values = {}) {
  const baseResponse = {
    body: '',
    isBase64Encoded: false,
    statusCode: 200,
    multiValueHeaders: {
      'content-type': ['application/json; charset=utf-8'],
      'x-powered-by': ['Express']
    }
  }
  const mergedResponse = mergeDeep(baseResponse, values)
  delete mergedResponse.cookies

  return mergedResponse
}

module.exports = {
  makeApiGatewayV1Event,
  makeApiGatewayV1Response
}

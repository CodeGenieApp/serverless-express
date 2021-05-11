const { URLSearchParams } = require('url')
const clone = require('./clone')
const mergeDeep = require('./merge-deep')

const apiGatewayV2Event = {
  version: '2.0',
  routeKey: '$default',
  // Default rawPath to event.path
  // 'rawPath': '/users',
  rawQueryString: '',
  headers: {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'content-length': '0',
    host: '6bwvllq3t2.execute-api.us-east-1.amazonaws.com',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    'x-amzn-trace-id': 'Root=1-5ff59707-4914805430277a6209549a59',
    'x-forwarded-for': '203.123.103.37',
    'x-forwarded-port': '443',
    'x-forwarded-proto': 'https'
  },
  requestContext: {
    accountId: '347971939225',
    apiId: '6bwvllq3t2',
    domainName: '6bwvllq3t2.execute-api.us-east-1.amazonaws.com',
    domainPrefix: '6bwvllq3t2',
    http: {
      // Default method to event.method
      // 'method': 'GET',
      // Default requestContext.http.path to event.path
      // 'path': '/users',
      protocol: 'HTTP/1.1',
      sourceIp: '203.123.103.37',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
    },
    requestId: 'YuSJQjZfoAMESbg=',
    routeKey: '$default',
    stage: '$default',
    time: '06/Jan/2021:10:55:03 +0000',
    timeEpoch: 1609930503973
  },
  isBase64Encoded: false
}

function makeApiGatewayV2Event (values = {}) {
  const baseEvent = clone(apiGatewayV2Event)
  const mergedEvent = mergeDeep(baseEvent, values)

  if (!mergedEvent.rawPath) mergedEvent.rawPath = values.path

  if (!mergedEvent.rawQueryString && values.multiValueQueryStringParameters) {
    const multiValueQueryStringParametersToArray = []
    Object.entries(values.multiValueQueryStringParameters)
      .forEach(([qKey, qValues]) => {
        qValues.forEach(qValue => {
          multiValueQueryStringParametersToArray.push([qKey, qValue])
        })
      })
    const rawQueryString = new URLSearchParams(multiValueQueryStringParametersToArray)
    mergedEvent.rawQueryString = rawQueryString.toString()
  }

  if (!mergedEvent.requestContext.http.path) mergedEvent.requestContext.http.path = values.path
  if (!mergedEvent.requestContext.http.method) mergedEvent.requestContext.http.method = values.httpMethod

  mergedEvent.headers = convertMultiValueHeadersToHeaders({ multiValueHeaders: values.multiValueHeaders })
  delete mergedEvent.multiValueHeaders
  delete mergedEvent.path
  return mergedEvent
}

function convertMultiValueHeadersToHeaders ({ multiValueHeaders }) {
  const headers = {}

  if (!multiValueHeaders) return headers

  Object.entries(multiValueHeaders).forEach(([key, value]) => {
    headers[key] = value.join(',')
  })

  return headers
}

function makeApiGatewayV2Response (values = {}, {
  shouldConvertContentLengthToInt = false
} = {}) {
  const baseResponse = {
    body: '',
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-powered-by': 'Express'
    }
  }
  values.headers = convertMultiValueHeadersToHeaders({ multiValueHeaders: values.multiValueHeaders })
  delete values.multiValueHeaders
  delete values.headers['set-cookie']

  if (shouldConvertContentLengthToInt) {
    // APIGWV2 returns content-length as a number instead of a string under certain conditions:
    // 404 missing route
    // image response
    if (values.headers['content-length']) values.headers['content-length'] = parseInt(values.headers['content-length'])
  }
  const mergedResponse = mergeDeep(baseResponse, values)

  return mergedResponse
}

module.exports = {
  makeApiGatewayV2Event,
  makeApiGatewayV2Response
}

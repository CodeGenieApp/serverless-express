const clone = require('./clone')
const mergeDeep = require('./merge-deep')

const RESPONSE_HEADERS_DENY_LIST = ['content-length']
const lambdaEdgeCf = {
  config: {
    distributionDomainName: 'd3qj9vk9486y6c.cloudfront.net',
    distributionId: 'E2I5C7O4FEQEKZ',
    eventType: 'viewer-request',
    requestId: 'BKXC0kFgBfWSEgribSo9EwziZB1FztiXQ96VRvTfFNHYCBv7Ko-RBQ=='
  },
  request: {
    clientIp: '203.123.103.37',
    headers: {
      host: [
        {
          key: 'Host',
          value: 'd3qj9vk9486y6c.cloudfront.net'
        }
      ],
      'user-agent': [
        {
          key: 'User-Agent',
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36'
        }
      ],
      'cache-control': [
        {
          key: 'Cache-Control',
          value: 'max-age=0'
        }
      ],
      accept: [
        {
          key: 'accept',
          value: 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        }
      ],
      'if-none-match': [
        {
          key: 'if-none-match',
          value: 'W/"2e-Lu6qxFOQSPFulDAGUFiiK6QgREo"'
        }
      ],
      'accept-language': [
        {
          key: 'accept-language',
          value: 'en-US,en;q=0.9'
        }
      ],
      'upgrade-insecure-requests': [
        {
          key: 'upgrade-insecure-requests',
          value: '1'
        }
      ],
      origin: [
        {
          key: 'Origin',
          value: 'https://d3qj9vk9486y6c.cloudfront.net'
        }
      ],
      'sec-fetch-site': [
        {
          key: 'Sec-Fetch-Site',
          value: 'same-origin'
        }
      ],
      'sec-fetch-mode': [
        {
          key: 'Sec-Fetch-Mode',
          value: 'cors'
        }
      ],
      'sec-fetch-dest': [
        {
          key: 'Sec-Fetch-Dest',
          value: 'empty'
        }
      ],
      referer: [
        {
          key: 'Referer',
          value: 'https://d3qj9vk9486y6c.cloudfront.net/users'
        }
      ],
      'accept-encoding': [
        {
          key: 'Accept-Encoding',
          value: 'gzip, deflate, br'
        }
      ]
    },
    body: {
      action: 'read-only',
      encoding: 'base64',
      inputTruncated: false
    }
    // 'method': 'GET',
    // 'querystring': '',
    // 'uri': '/'
  }
}

function makeLambdaEdgeEvent (values = {}) {
  const baseEvent = clone(lambdaEdgeCf)
  if (!values.request) values.request = {}
  if (!values.request.headers) values.request.headers = convertMultiValueHeaders({ multiValueHeaders: values.multiValueHeaders })

  const mergedEvent = mergeDeep(baseEvent, values)

  if (!mergedEvent.request.uri) mergedEvent.request.uri = values.path

  if (!mergedEvent.request.querystring && values.multiValueQueryStringParameters) {
    const multiValueQueryStringParametersToArray = []
    Object.entries(values.multiValueQueryStringParameters)
      .forEach(([qKey, qValues]) => {
        qValues.forEach(qValue => {
          multiValueQueryStringParametersToArray.push([qKey, qValue])
        })
      })
    const querystring = new URLSearchParams(multiValueQueryStringParametersToArray)
    mergedEvent.request.querystring = querystring.toString()
  }

  if (!mergedEvent.request.method) mergedEvent.request.method = values.httpMethod

  if (!mergedEvent.request.body.data) {
    mergedEvent.request.body.data = values.isBase64Encoded ? values.body : Buffer.from(values.body || '', 'binary').toString('base64')
  }
  // if (!mergedEvent.request.querysting) mergedEvent.request.querysting = values.httpMethod
  return {
    Records: [{
      cf: mergedEvent
    }]
  }
}

function convertMultiValueHeaders ({ multiValueHeaders }) {
  const headers = {}

  if (!multiValueHeaders) return headers

  Object.entries(multiValueHeaders).forEach(([key, value]) => {
    const headerKeyLowerCase = key.toLowerCase()
    if (RESPONSE_HEADERS_DENY_LIST.includes(headerKeyLowerCase)) return
    if (!headers[headerKeyLowerCase]) headers[headerKeyLowerCase] = []
    const headersArray = value.map(v => ({
      key: headerKeyLowerCase,
      value: v
    }))
    headers[headerKeyLowerCase].push(...headersArray)
  })
  return headers
}

function makeLambdaEdgeResponse (values = {}) {
  const baseResponse = {
    body: '',
    status: 200,
    bodyEncoding: 'text',
    headers: {
      'content-type': [{
        key: 'content-type',
        value: 'application/json; charset=utf-8'
      }],
      'x-powered-by': [{
        key: 'x-powered-by',
        value: 'Express'
      }]
    }
  }

  values.headers = convertMultiValueHeaders({ multiValueHeaders: values.multiValueHeaders })
  delete values.multiValueHeaders
  delete values.cookies

  values.bodyEncoding = values.isBase64Encoded ? 'base64' : 'text'
  delete values.isBase64Encoded
  const mergedResponse = mergeDeep(baseResponse, values)
  if (values.body) {
    mergedResponse.body.data = values.body
  }

  if (mergedResponse.statusCode) {
    mergedResponse.status = mergedResponse.statusCode
    delete mergedResponse.statusCode
  }

  return mergedResponse
}

module.exports = {
  makeLambdaEdgeEvent,
  makeLambdaEdgeResponse
}

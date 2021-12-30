const { URLSearchParams } = require('url')
const clone = require('./clone')
const mergeDeep = require('./merge-deep')

const azureHttpFunctionV3Event = {
  traceContext: { traceparent: '', tracestate: '', attributes: {} },
  req: {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
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
    }
  }
}

function isJsonString (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function makeAzureHttpFunctionV3Event (values = {}) {
  process.env.FUNCTIONS_EXTENSION_VERSION = '~3'

  const baseEvent = clone(azureHttpFunctionV3Event)
  const mergedEvent = mergeDeep(baseEvent, values)

  mergedEvent.req.method = values.httpMethod
  mergedEvent.req.url = 'http://localhost:7071'
  mergedEvent.req.url += values.path

  if (values.multiValueQueryStringParameters) {
    const multiValueQueryStringParametersToArray = []
    Object.entries(values.multiValueQueryStringParameters).forEach(([qKey, qValues]) => {
      qValues.forEach((qValue) => {
        multiValueQueryStringParametersToArray.push([qKey, qValue])
      })
    })
    const rawQueryString = new URLSearchParams(multiValueQueryStringParametersToArray)
    mergedEvent.req.url += '?' + rawQueryString.toString()
  }

  if (values.body && Buffer.from(values.body, 'base64').toString('base64') === values.body) {
    mergedEvent.req.rawBody = Buffer.from(values.body, 'base64').toString('utf8')
  } else {
    mergedEvent.req.rawBody = values.body
  }

  if (isJsonString(mergedEvent.req.rawBody)) {
    mergedEvent.req.body = JSON.parse(mergedEvent.req.rawBody)
  } else {
    mergedEvent.req.body = mergedEvent.req.rawBody
  }

  mergedEvent.req.headers = convertMultiValueHeadersToHeaders({ multiValueHeaders: values.multiValueHeaders })

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

function makeAzureHttpFunctionV3Response (values = {}, { shouldConvertContentLengthToInt = false } = {}) {
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
    if (values.headers['content-length']) values.headers['content-length'] = parseInt(values.headers['content-length'])
  }

  const mergedResponse = mergeDeep(baseResponse, values)

  return mergedResponse
}

module.exports = {
  makeAzureHttpFunctionV3Event,
  makeAzureHttpFunctionV3Response
}

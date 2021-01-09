const url = require('url')
// const { getEventBody } = require('../utils')

function getRequestValuesFromAzureFunctionEvent ({ event, context: req, log }) {
  log.debug('SERVERLESS_EXPRESS:getRequestValuesFromAzureFunctionEvent', { event, req })
  const {
    originalUrl,
    query,
    headers,
    rawBody,
    method
  } = req
  const { pathname } = url.parse(originalUrl)
  const path = url.format({
    // TODO: replace based on host.json extensions.http.routePrefix
    pathname: pathname.replace('/api', ''),
    query
  })

  // let body

  // if (req.body) {
  //   body = getEventBody({ event: req })
  //   // TODO: base64 encoding for Azure?
  //   // const isBase64Encoded = req.isBase64Encoded
  //   // headers['content-length'] = Buffer.byteLength(body, isBase64Encoded ? 'base64' : 'utf8')
  // }

  return {
    method,
    headers,
    body: rawBody,
    remoteAddress: '',
    path
  }

  // const event = {
  //   path: path,
  //   httpMethod: req.method,
  //   headers: req.headers || {},
  //   queryStringParameters: req.query || {},
  //   body: req.rawBody,
  //   isBase64Encoded: false
  // }

  // const awsContext = {
  //   succeed (awsResponse) {
  //     context.res.status = awsResponse.statusCode
  //     context.res.headers = {
  //       ...context.res.headers,
  //       ...awsResponse.headers
  //     }
  //     context.res.body = Buffer.from(
  //       awsResponse.body,
  //       awsResponse.isBase64Encoded ? 'base64' : 'utf8'
  //     )
  //     context.res.isRaw = true

  //     context.done()
  //   }
  // }
}

function getResponseToAzureFunction ({
  statusCode,
  body,
  headers,
  // isBase64Encoded,
  event: context
}) {
  // const transferEncodingHeader = headers['transfer-encoding']

  // // chunked transfer not currently supported by API Gateway
  // if (transferEncodingHeader && transferEncodingHeader.includes('chunked')) {
  //   headers['transfer-encoding'] = transferEncodingHeader.filter(headerValue => headerValue !== 'chunked')
  // }
  console.log('bodybody', body)
  context.res = {
    body,
    status: statusCode,
    headers
  }

  // TODO: This should happen as part of makeResolver.succeed
  context.done()

  return {
    statusCode,
    body,
    headers,
    // isBase64Encoded,
    event: context
  }
}

module.exports = {
  getRequestValues: getRequestValuesFromAzureFunctionEvent,
  response: getResponseToAzureFunction
}

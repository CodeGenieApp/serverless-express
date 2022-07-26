const url = require('url')
const { getCommaDelimitedHeaders, parseCookie } = require('../utils')

function getRequestValuesFromHttpFunctionEvent ({ event }) {
  const context = event.req

  const method = context.method
  const urlObject = new url.URL(context.url)
  const path = urlObject.pathname + urlObject.search
  const headers = { cookies: context.headers.cookie }

  Object.entries(context.headers).forEach(([headerKey, headerValue]) => {
    headers[headerKey.toLowerCase()] = headerValue
  })

  const remoteAddress = headers['x-forwarded-for']

  const body = context.rawBody
  if (body) {
    headers['content-length'] = Buffer.byteLength(body, 'utf8')
  }

  return {
    method,
    headers,
    body,
    remoteAddress,
    path
  }
}

function getResponseToHttpFunction ({ statusCode, body, headers = {}, isBase64Encoded = false, response = {} }) {
  const responseToHttpFunction = {
    statusCode,
    body,
    isBase64Encoded
  }

  if (isBase64Encoded) {
    responseToHttpFunction.body = Buffer.from(body, 'base64')
    responseToHttpFunction.isBase64Encoded = false
  }

  const cookies = []
  // headers['set-cookie'] can be a string of one cookie, or an array of cookies
  // headerCookies should always be an array
  const headerCookies = [].concat(headers['set-cookie'] || [])

  // Convert 'set-cookie' to Azure Function 3.x cookie object array
  // https://github.com/Azure/azure-functions-nodejs-worker/blob/v3.x/types/index.d.ts#L150
  if (headerCookies.length > 0) {
    for (const headerCookie of headerCookies) {
      const parsedCookie = parseCookie(headerCookie)
      const nameValueTuple = headerCookie.split(';')[0].split('=')

      const cookie = { name: nameValueTuple[0], value: nameValueTuple[1] }

      if (headerCookie.toLowerCase().includes('httponly')) {
        cookie.httpOnly = true
      }

      if (headerCookie.toLowerCase().includes('secure')) {
        cookie.secure = true
      }

      if (parsedCookie['max-age']) {
        cookie.maxAge = +parsedCookie['max-age']
      }

      if (parsedCookie.samesite) {
        cookie.sameSite = parsedCookie.samesite
      }

      if (parsedCookie.expires && typeof parsedCookie.expires === 'string') {
        cookie.expires = new Date(parsedCookie.expires)
      } else if (parsedCookie.expires && typeof parsedCookie.expires === 'number') {
        cookie.expires = parsedCookie.expires
      }

      if (parsedCookie.path) {
        cookie.path = parsedCookie.path
      }

      if (parsedCookie.domain) {
        cookie.domain = parsedCookie.domain
      }

      cookies.push(cookie)
    }

    responseToHttpFunction.cookies = cookies
    delete headers['set-cookie']
  }

  responseToHttpFunction.headers = getCommaDelimitedHeaders({ headersMap: headers })

  return responseToHttpFunction
}

module.exports = {
  getRequest: getRequestValuesFromHttpFunctionEvent,
  getResponse: getResponseToHttpFunction
}


const url = require('url')
const isType = require('type-is')

function getEventBody ({
  event,
  body = event.body,
  isBase64Encoded = event.isBase64Encoded
}) {
  return Buffer.from(body, isBase64Encoded ? 'base64' : 'utf8')
}

function getContentType ({ contentTypeHeader }) {
  // only compare mime type; ignore encoding part
  return contentTypeHeader ? contentTypeHeader.split(';')[0] : ''
}

function isContentTypeBinaryMimeType ({ contentType, binaryMimeTypes }) {
  return binaryMimeTypes.length > 0 && Boolean(isType.is(contentType, binaryMimeTypes))
}

function getPathWithQueryStringParams ({
  event,
  pathname = event.path,
  query = event.multiValueQueryStringParameters
}) {
  return url.format({
    pathname,
    query
  })
}

function getRandomString () {
  return Math.random().toString(36).substring(2, 15)
}

module.exports = {
  getPathWithQueryStringParams,
  getEventBody,
  isContentTypeBinaryMimeType,
  getContentType,
  getRandomString
}


const url = require('url')
const isType = require('type-is')

function getContentType ({ contentTypeHeader }) {
  // only compare mime type; ignore encoding part
  return contentTypeHeader ? contentTypeHeader.split(';')[0] : ''
}

function isContentTypeBinaryMimeType ({ contentType, binaryMimeTypes }) {
  return binaryMimeTypes.length > 0 && Boolean(isType.is(contentType, binaryMimeTypes))
}

function getPathWithQueryStringParams ({
  event,
  query = event.multiValueQueryStringParameters,
  // NOTE: Use `event.pathParameters.proxy` if available ({proxy+}); fall back to `event.path`
  path = (event.pathParameters && event.pathParameters.proxy && `/${event.pathParameters.proxy}`) || event.path,
  // NOTE: Strip base path for custom domains
  stripBasePath = '',
  replaceRegex = new RegExp(`^${stripBasePath}`)
}) {
  return url.format({
    pathname: path.replace(replaceRegex, ''),
    query
  })
}

function getRandomString () {
  return Math.random().toString(36).substring(2, 15)
}

module.exports = {
  getPathWithQueryStringParams,
  isContentTypeBinaryMimeType,
  getContentType,
  getRandomString
}

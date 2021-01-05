const ServerlessRequest = require('../request')
const ServerlessResponse = require('../response')
const { waitForStreamComplete } = require('../utils')

async function getExpressRequestResponse ({
  method,
  headers,
  body,
  remoteAddress,
  path
}) {
  const request = new ServerlessRequest({
    method,
    headers,
    body,
    remoteAddress,
    url: path
  })
  await waitForStreamComplete(request)

  const response = new ServerlessResponse(request)

  return { request, response }
}

async function sendExpressRequest ({ app, requestValues }) {
  const { request, response } = await getExpressRequestResponse(requestValues)

  app.handle(request, response)

  return waitForStreamComplete(response)
}

module.exports = {
  getRequestResponse: getExpressRequestResponse,
  sendRequest: sendExpressRequest
}

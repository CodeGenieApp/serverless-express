const ServerlessRequest = require('../request')
const ServerlessResponse = require('../response')

function waitForStreamComplete (stream) {
  if (stream.complete || stream.writableEnded) {
    return stream
  }

  return new Promise((resolve, reject) => {
    stream.once('error', complete)
    stream.once('end', complete)
    stream.once('finish', complete)

    let isComplete = false

    function complete (err) {
      if (isComplete) {
        return
      }

      isComplete = true

      stream.removeListener('error', complete)
      stream.removeListener('end', complete)
      stream.removeListener('finish', complete)

      if (err) {
        reject(err)
      } else {
        resolve(stream)
      }
    }
  })
}

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

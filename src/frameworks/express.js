async function sendExpressRequest ({ app, request, response }) {
  app.handle(request, response)
}

module.exports = {
  sendRequest: sendExpressRequest
}

async function sendKoaRequest ({ app, request, response }) {
  app.callback()(request, response)
}

module.exports = {
  sendRequest: sendKoaRequest
}

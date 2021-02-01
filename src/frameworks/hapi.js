async function sendHapiRequest ({ app, request, response }) {
  app(request, response)
}

module.exports = {
  sendRequest: sendHapiRequest
}

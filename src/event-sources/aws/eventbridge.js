const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromEventBridge = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'events.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

module.exports = {
  getRequest: getRequestValuesFromEventBridge,
  getResponse: emptyResponseMapper
}

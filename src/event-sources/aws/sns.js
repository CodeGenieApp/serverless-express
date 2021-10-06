const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromSns = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'sns.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

module.exports = {
  getRequest: getRequestValuesFromSns,
  getResponse: emptyResponseMapper
}

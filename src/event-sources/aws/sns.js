const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromSns = ({ event }) => {
  const method = 'POST'
  const headers = {}
  const body = event
  const host = 'sns.amazonaws.com'

  return {
    method,
    headers,
    body,
    host
  }
}

module.exports = {
  getRequest: getRequestValuesFromSns,
  getResponse: emptyResponseMapper
}

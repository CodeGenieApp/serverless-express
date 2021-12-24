const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromSns = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'sqs.amazonaws.com' }
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

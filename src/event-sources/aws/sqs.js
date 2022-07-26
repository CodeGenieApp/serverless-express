const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromSqs = ({ event }) => {
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
  getRequest: getRequestValuesFromSqs,
  getResponse: emptyResponseMapper
}

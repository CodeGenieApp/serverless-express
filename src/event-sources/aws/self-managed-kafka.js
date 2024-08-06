const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromSelfManagedKafka = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'self-managed-kafka' }
  const body = event

  return {
    method,
    headers,
    body
  }
}
module.exports = {
  getRequest: getRequestValuesFromSelfManagedKafka,
  getResponse: emptyResponseMapper
}

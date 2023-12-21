const { emptyResponseMapperToEventSource } = require('../utils')

const getRequestValuesFromDynamoDB = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'dynamodb.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

module.exports = {
  getRequest: getRequestValuesFromDynamoDB,
  getResponse: emptyResponseMapperToEventSource
}

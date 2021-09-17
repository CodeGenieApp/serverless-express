const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromDynamoDB = ({ event }) => {
  const method = 'POST'
  const headers = { Host: 'dynamodb.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

module.exports = {
  getRequest: getRequestValuesFromDynamoDB,
  getResponse: emptyResponseMapper
}

const { emptyResponseMapper } = require('../utils')

const getRequestValuesFromDynamoDB = ({ event }) => {
  const method = 'POST'
  const headers = {}
  const body = event
  const host = 'dynamodb.amazonaws.com'

  return {
    method,
    headers,
    body,
    host
  }
}

module.exports = {
  getRequest: getRequestValuesFromDynamoDB,
  getResponse: emptyResponseMapper
}

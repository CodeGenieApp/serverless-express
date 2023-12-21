const { emptyResponseMapperToEventSource } = require('../utils')

const getRequestValuesFromKinesis = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'kinesis.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

module.exports = {
  getRequest: getRequestValuesFromKinesis,
  getResponse: emptyResponseMapperToEventSource
}

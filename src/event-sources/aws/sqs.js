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

const getResponseToSqs = ({ body }) => JSON.parse(body)

module.exports = {
  getRequest: getRequestValuesFromSqs,
  getResponse: getResponseToSqs
}

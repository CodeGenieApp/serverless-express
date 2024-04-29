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

const getResponseToSqs = ({ body }) => {
  try {
    return JSON.parse(body)
  } catch (error) {}
}

module.exports = {
  getRequest: getRequestValuesFromSqs,
  getResponse: getResponseToSqs
}

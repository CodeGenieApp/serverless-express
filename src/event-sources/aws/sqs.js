const getRequestValuesFromSqs = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'sqs.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body,
  }
}

const getResponseToSqs = ({ statusCode, body }) => {
  if (statusCode >= 400) {
    throw new Error(body)
  }

  return JSON.parse(body)
}

module.exports = {
  getRequest: getRequestValuesFromSqs,
  getResponse: getResponseToSqs,
}

const getRequestValuesFromStepFunctions = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'stepfunctions.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body,
  }
}

function getResponseToStepFunctions({
  statusCode,
  body,
  isBase64Encoded = false,
}) {
  if (statusCode >= 400) {
    throw new Error(body)
  }

  if (isBase64Encoded) {
    throw new Error('base64 encoding is not supported')
  }

  return JSON.parse(body)
}

module.exports = {
  getRequest: getRequestValuesFromStepFunctions,
  getResponse: getResponseToStepFunctions,
}

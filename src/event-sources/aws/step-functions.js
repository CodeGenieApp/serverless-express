const getRequestValuesFromStepFunctions = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'stepfunctions.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

const getResponseToStepFunctions = ({
  body,
  isBase64Encoded = false
}) => {
  if (isBase64Encoded) {
    throw new Error('base64 encoding is not supported')
  }

  return JSON.parse(body)
}

module.exports = {
  getRequest: getRequestValuesFromStepFunctions,
  getResponse: getResponseToStepFunctions
}

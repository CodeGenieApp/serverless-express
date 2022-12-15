
const getRequestValuesFromLambdaInvoke = ({ event }) => {
  const method = 'POST'
  const headers = { host: 'lambda.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

const getResponseFromLambdaInvoke = ({ statusCode, body }) => {
  return {
    statusCode, body
  }
}

module.exports = {
  getRequest: getRequestValuesFromLambdaInvoke,
  getResponse: getResponseFromLambdaInvoke
}

const getRequestValuesFromS3 = ({ event }) => {
  const method = 'POST'
  const headers = { host: 's3.amazonaws.com' }
  const body = event

  return {
    method,
    headers,
    body
  }
}

const getResponseToS3 = ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) => ({
  statusCode,
  headers,
  body,
  isBase64Encoded
})

module.exports = {
  getRequest: getRequestValuesFromS3,
  getResponse: getResponseToS3
}

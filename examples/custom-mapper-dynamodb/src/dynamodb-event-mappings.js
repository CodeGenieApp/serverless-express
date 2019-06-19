function getMethodBasedOnRecordEventName ({ record }) {
  const { eventName } = record
  switch (eventName) {
    case 'INSERT':
      return 'post'
    case 'MODIFY':
      return 'put'
    case 'REMOVE':
      return 'delete'
  }
}

function getPath ({ method, record }) {
  switch (method) {
    case 'post':
      return '/users'
    default:
      return `/users/${record.dynamodb.NewImage.id.S}`
  }
}

function mapDynamoDbEventToHttpRequest ({ event }) {
  const record = event.Records[0]
  const method = getMethodBasedOnRecordEventName({ record })
  const path = getPath({ method, record })

  return {
    method,
    path,
    headers: {}
  }
}

function mapResponseToDynamoDb ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  return {
    statusCode,
    body,
    headers,
    isBase64Encoded
  }
}

module.exports = {
  mapDynamoDbEventToHttpRequest,
  mapResponseToDynamoDb
}

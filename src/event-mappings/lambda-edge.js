const { mapEventToHttpRequest, mapResponseToService } = require('./utils')

const mapLambdaEdgeEventToHttpRequest = ({ event, socketPath }) => mapEventToHttpRequest({ event, socketPath })
const mapResponseToLambdaEdge = ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) => mapResponseToService({
  statusCode,
  body,
  headers,
  isBase64Encoded
})

module.exports = {
  mapLambdaEdgeEventToHttpRequest,
  mapResponseToLambdaEdge
}

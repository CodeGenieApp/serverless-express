const { mapEventToHttpRequest, mapResponseToService } = require('./utils')

const mapAlbEventToHttpRequest = ({ event }) => mapEventToHttpRequest({ event })
const mapResponseToAlb = ({
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
  mapAlbEventToHttpRequest,
  mapResponseToAlb
}

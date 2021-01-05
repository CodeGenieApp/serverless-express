const { getRequestValuesFromEvent, getResponseToService } = require('./utils')

const getRequestValuesFromAlbEvent = ({ event }) => getRequestValuesFromEvent({ event })
const getResponseToAlb = ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) => getResponseToService({
  statusCode,
  body,
  headers,
  isBase64Encoded
})

module.exports = {
  getRequestValues: getRequestValuesFromAlbEvent,
  response: getResponseToAlb
}

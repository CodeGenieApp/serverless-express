const { getCurrentInvoke } = require('./current-invoke')

module.exports.eventContext = options => function apiGatewayEventParser (req, res, next) {
  options = options || {}
  const reqPropKey = options.reqPropKey || 'apiGateway'
  const deleteHeaders = options.deleteHeaders === undefined ? true : options.deleteHeaders

  const currentInvoke = getCurrentInvoke()

  req[reqPropKey] = currentInvoke

  if (!deleteHeaders) {
    const clonedEventWithoutBody = JSON.parse(JSON.stringify(currentInvoke.event))
    delete clonedEventWithoutBody.body

    req.headers['x-apigateway-event'] = encodeURIComponent(JSON.stringify(clonedEventWithoutBody))
    req.headers['x-apigateway-context'] = encodeURIComponent(JSON.stringify(currentInvoke.context))
  }

  next()
}

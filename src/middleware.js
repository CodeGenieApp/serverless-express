module.exports.eventContext = options => function apiGatewayEventParser (req, res, next) {
  options = options || {} // defaults: {reqPropKey: 'apiGateway', deleteHeaders: true}
  const reqPropKey = options.reqPropKey || 'apiGateway'
  const deleteHeaders = options.deleteHeaders === undefined ? true : options.deleteHeaders

  if (!req.headers['x-apigateway-event'] || !req.headers['x-apigateway-context']) {
    console.error('Missing x-apigateway-event or x-apigateway-context header(s)')
    next()
    return
  }

  req[reqPropKey] = {
    event: JSON.parse(decodeURIComponent(req.headers['x-apigateway-event'])),
    context: JSON.parse(decodeURIComponent(req.headers['x-apigateway-context']))
  }

  if (deleteHeaders) {
    delete req.headers['x-apigateway-event']
    delete req.headers['x-apigateway-context']
  }

  next()
}

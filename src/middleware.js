module.exports.eventContext = options => function apiGatewayEventParser (req, res, next) {
  options = options || {} // defaults: {reqPropKey: 'apiGateway', deleteHeaders: true, fromALB: false}
  const reqPropKey = options.fromALB ? options.reqPropKey || 'alb' : options.reqPropKey || 'apiGateway'
  const deleteHeaders = options.deleteHeaders === undefined ? true : options.deleteHeaders
  const eventKey = options.fromALB ? 'x-alb-event' : 'x-apigateway-event'
  const contextKey = options.fromALB ? 'x-alb-context' : 'x-apigateway-context'

  if (!req.headers[eventKey] || !req.headers[contextKey]) {
    console.error(`Missing ${eventKey} or ${contextKey} header(s)`)
    next()
    return
  }

  req[reqPropKey] = {
    event: JSON.parse(decodeURIComponent(req.headers[eventKey])),
    context: JSON.parse(decodeURIComponent(req.headers[contextKey]))
  }

  if (deleteHeaders) {
    delete req.headers[eventKey]
    delete req.headers[contextKey]
  }

  next()
}

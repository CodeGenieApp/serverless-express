module.exports.eventContext = ({
  reqPropKey = 'apiGateway',
  deleteHeaders = true
} = {}) => function apiGatewayEventParser (req, res, next) {
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

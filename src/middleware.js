module.exports.eventContext = ({
  reqPropKey = 'lambda',
  deleteHeaders = true
} = {}) => function apiGatewayEventParser (req, res, next) {
  if (!req.headers['x-lambda-event'] || !req.headers['x-lambda-context']) {
    console.error('Missing x-lambda-event or x-lambda-context header(s)')
    next()
    return
  }

  req[reqPropKey] = {
    event: JSON.parse(decodeURIComponent(req.headers['x-lambda-event'])),
    context: JSON.parse(decodeURIComponent(req.headers['x-lambda-context']))
  }

  if (deleteHeaders) {
    delete req.headers['x-lambda-event']
    delete req.headers['x-lambda-context']
  }

  next()
}

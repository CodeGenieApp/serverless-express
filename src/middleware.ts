export const eventContext = (options?: any) => (req: any, _res: any, next: any) => {
  options = options || {} // defaults: {reqPropKey: 'apiGateway', deleteHeaders: true}
  const reqPropKey = options.reqPropKey || 'apiGateway'
  const deleteHeaders = options.deleteHeaders === undefined ? true : options.deleteHeaders

  if (!req.headers['x-apigateway-event'] || !req.headers['x-apigateway-context']) {
    // tslint:disable-next-line:no-console
    console.error('Missing x-apigateway-event or x-apigateway-context header(s)')
    next()
    return
  }

  req[reqPropKey] = {
    event: JSON.parse(decodeURIComponent(req.headers['x-apigateway-event'])),
    context: JSON.parse(decodeURIComponent(req.headers['x-apigateway-context'])),
  }

  if (deleteHeaders) {
    delete req.headers['x-apigateway-event']
    delete req.headers['x-apigateway-context']
  }

  next()
}

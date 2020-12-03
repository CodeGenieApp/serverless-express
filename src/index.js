const serverlessExpress = require('@vendia/serverless-express')

exports.createServer = serverlessExpress.createServer
exports.proxy = serverlessExpress.proxy

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.getPathWithQueryStringParams = serverlessExpress.getPathWithQueryStringParams
  exports.mapApiGatewayEventToHttpRequest = serverlessExpress.mapApiGatewayEventToHttpRequest
  exports.forwardResponseToApiGateway = serverlessExpress.forwardResponseToApiGateway
  exports.forwardConnectionErrorResponseToApiGateway = serverlessExpress.forwardConnectionErrorResponseToApiGateway
  exports.forwardLibraryErrorResponseToApiGateway = serverlessExpress.forwardLibraryErrorResponseToApiGateway
  exports.forwardRequestToNodeServer = serverlessExpress.forwardRequestToNodeServer
  exports.startServer = serverlessExpress.startServer
  exports.getSocketPath = serverlessExpress.getSocketPath
  exports.makeResolver = serverlessExpress.makeResolver
}

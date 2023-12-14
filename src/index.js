const codeGenieServerlessExpress = require('@codegenie/serverless-express')

exports.createServer = codeGenieServerlessExpress.createServer
exports.proxy = codeGenieServerlessExpress.proxy

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  exports.getPathWithQueryStringParams = codeGenieServerlessExpress.getPathWithQueryStringParams
  exports.mapApiGatewayEventToHttpRequest = codeGenieServerlessExpress.mapApiGatewayEventToHttpRequest
  exports.forwardResponseToApiGateway = codeGenieServerlessExpress.forwardResponseToApiGateway
  exports.forwardConnectionErrorResponseToApiGateway = codeGenieServerlessExpress.forwardConnectionErrorResponseToApiGateway
  exports.forwardLibraryErrorResponseToApiGateway = codeGenieServerlessExpress.forwardLibraryErrorResponseToApiGateway
  exports.forwardRequestToNodeServer = codeGenieServerlessExpress.forwardRequestToNodeServer
  exports.startServer = codeGenieServerlessExpress.startServer
  exports.getSocketPath = codeGenieServerlessExpress.getSocketPath
  exports.makeResolver = codeGenieServerlessExpress.makeResolver
}

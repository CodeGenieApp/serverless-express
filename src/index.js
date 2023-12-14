const codeGenieServerlessExpress = require('@codegenie/serverless-express')

module.exports = codeGenieServerlessExpress.configure
module.exports.getCurrentInvoke = codeGenieServerlessExpress.getCurrentInvoke
module.exports.configure = codeGenieServerlessExpress.configure
module.exports.createServer = codeGenieServerlessExpress.createServer
module.exports.proxy = codeGenieServerlessExpress.proxy

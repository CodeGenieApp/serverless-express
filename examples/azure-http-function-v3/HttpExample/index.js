const serverlessExpress = require('../../../src/index') // require('@codegenie/serverless-express')
const app = require('./app')
const cachedServerlessExpress = serverlessExpress({ app })

module.exports = async function (context, req) {
  return cachedServerlessExpress(context, req)
}

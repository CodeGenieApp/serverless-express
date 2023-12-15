require('source-map-support/register')
const serverlessExpress = require('@codegenie/serverless-express')
const app = require('./app')

exports.handler = serverlessExpress({ app })

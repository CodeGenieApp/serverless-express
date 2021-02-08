require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

exports.handler = serverlessExpress({ app })

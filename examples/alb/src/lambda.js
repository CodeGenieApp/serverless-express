const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

const se = serverlessExpress.configure({
  app
})

exports.handler = se.handler

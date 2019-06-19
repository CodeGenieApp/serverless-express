const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

const ase = awsServerlessExpress.configure({
  app
})

exports.handler = ase.handler

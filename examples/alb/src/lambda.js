// const awsServerlessExpress = require(process.env.NODE_ENV === 'test' ? '../../index' : 'aws-serverless-express')
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

const ase = awsServerlessExpress.configure({
  app,
  resolutionMode: 'PROMISE'
  // eventSource: ''
})

exports.handler = ase.handler

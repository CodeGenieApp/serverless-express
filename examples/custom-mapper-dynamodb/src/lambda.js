const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const { mapDynamoDbEventToHttpRequest, mapResponseToDynamoDb } = require('./dynamodb-event-mappings')

const ase = awsServerlessExpress.configure({
  app,
  eventFns: {
    request: mapDynamoDbEventToHttpRequest,
    response: mapResponseToDynamoDb
  },
  loggerConfig: {
    level: 'debug'
  }
})

exports.handler = ase.handler

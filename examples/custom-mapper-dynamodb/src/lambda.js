require('source-map-support/register')
const serverlessExpress = require('@codegenie/serverless-express')
const app = require('./app')
const { mapDynamoDbEventToHttpRequest, mapResponseToDynamoDb } = require('./dynamodb-event-mappings')

exports.handler = serverlessExpress({
  app,
  eventSource: {
    getRequest: mapDynamoDbEventToHttpRequest,
    getResponse: mapResponseToDynamoDb
  }
})

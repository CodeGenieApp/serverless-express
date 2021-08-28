require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

let serverlessExpressInstance

function asyncTask () {
  return new Promise((resolve) => {
    setTimeout(() => resolve('connected to database'), 1000)
  })
}

async function setup (event, context) {
  const asyncValue = await asyncTask()
  console.log(asyncValue)
  serverlessExpressInstance = serverlessExpress({ app })
  return serverlessExpressInstance(event, context)
}

function handler (event, context) {
  if (serverlessExpressInstance) return serverlessExpressInstance(event, context)

  return setup(event, context)
}

exports.handler = handler

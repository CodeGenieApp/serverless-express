// const lambdaFunction = require('../dist/lambda.js')
const lambdaFunction = require('../src/lambda.js')
const apiGatewayEvent = require('../lambda-edge-event.json')

const context = {
  succeed: v => {
    console.info(v)
    process.exit(0)
  }
}
const callback = (e, v) => {
  if (e) console.error(e)
  if (v) console.info(v)
  process.exit(0)
}
lambdaFunction.handler(apiGatewayEvent, context, callback)

process.stdin.resume()

function exitHandler (options, err) {
  if (err) console.error(err.stack)
  if (options.exit) process.exit()
}

process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true })) // ctrl+c event
process.on('SIGTSTP', exitHandler.bind(null, { exit: true })) // ctrl+v event
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

const lambdaFunction = require('../src/lambda.js')
const albEvent = require('../dynamodb-event.json')

const server = lambdaFunction.handler(albEvent, {})
  .then(v => {
    console.info(v)
    process.exit(0)
  })
  .catch(v => {
    console.error(v)
    process.exit(1)
  })

process.stdin.resume()

function exitHandler (options, err) {
  if (options.cleanup && server && server.close) {
    server.close()
  }

  if (err) console.error(err.stack)
  if (options.exit) process.exit()
}

process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true })) // ctrl+c event
process.on('SIGTSTP', exitHandler.bind(null, { exit: true })) // ctrl+v event
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

const awsServerlessExpress = require('aws-serverless-express')
const appPromise = require('./app')

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)
const binaryMimeTypes = [
  // '*/*'
]

exports.handler = async (event, context, callback) => {
  const app = await appPromise
  const ase = awsServerlessExpress.configure({
    app,
    binaryMimeTypes,
    respondWithErrors: true,
    loggerConfig: {
      level: 'debug'
    }
  })

  return ase.proxy({ event, context, callback })
}

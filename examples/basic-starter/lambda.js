const awsServerlessExpress = require(process.env.NODE_ENV === 'test' ? '../../index' : 'aws-serverless-express')
const app = require('./app')

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)
const binaryMimeTypes = [
  '*/*'
]
const ase = awsServerlessExpress.configure({
  app,
  binaryMimeTypes,
  respondWithErrors: true,
  loggerConfig: {
    level: 'debug'
  }
})
exports.handler = ase.handler

const serverlessExpress = require(process.env.NODE_ENV === 'test' ? '../../index' : '@vendia/serverless-express')
const app = require('./app')

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)
const binaryMimeTypes = [
  // '*/*'
]
const se = serverlessExpress.configure({
  app,
  binaryMimeTypes,
  respondWithErrors: true,
  loggerConfig: {
    level: 'debug'
  }
})
exports.handler = se.handler

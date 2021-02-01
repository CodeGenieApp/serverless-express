require('source-map-support/register')
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)
const binaryMimeTypes = [
  '*/*'
]

exports.handler = serverlessExpress({
  app,
  binaryMimeTypes
}).handler

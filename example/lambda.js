'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)
const binaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
]
exports.handler = (event, context) => {
	const serverPromise = context.serverPromise || 
		Promise.resolve().then(() => awsServerlessExpress.createServer(app, null, binaryMimeTypes))
	if (!context.serverPromise) {
		context.serverPromise = serverPromise
	}
	const contextWithoutServerPromise = Object.assign({}, context)
	delete contextWithoutServerPromise.serverPromise
	serverPromise.then(server => awsServerlessExpress.proxy(server, event, contextWithoutServerPromise))
}

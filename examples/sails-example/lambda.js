require('source-map-support/register');
const serverlessExpress = require('@codegenie/serverless-express');
const appPromise = require('./app');

exports.handler = async (event, context, callback) => {
  const app = await appPromise;
  return serverlessExpress({ app })(event, context, callback);
};

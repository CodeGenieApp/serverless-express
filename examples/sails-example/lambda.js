require('source-map-support/register');
const serverlessExpress = require('@vendia/serverless-express');
const appPromise = require('./app');

exports.handler = async (event, context, callback) => {
  const app = await appPromise;
  return serverlessExpress({ app })(event, context, callback);
};

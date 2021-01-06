# Serverless Express

[![npm](https://img.shields.io/npm/v/@vendia/serverless-express.svg)]() [![npm](https://img.shields.io/npm/dm/aws-serverless-express.svg)]() [![dependencies Status](https://david-dm.org/vendia/serverless-express/status.svg)](https://david-dm.org/vendia/serverless-express) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

Run REST APIs and other web applications using your existing [Node.js](https://nodejs.org/) application framework (Express, Koa, Hapi, Sails, etc.), on top of [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/).

```bash
npm install @vendia/serverless-express
```

## Quick Start/Example

Want to get up and running quickly? [Check out our basic starter example](examples/basic-starter-api-gateway-v1) that includes:

- Lambda function
- Express application
- [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model)/[CloudFormation](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) template
- Helper scripts to configure, deploy, and manage your application

If you want to migrate an existing application to AWS Lambda, it's advised to get the minimal example up and running first, and then copy your application source in.

## Minimal Lambda handler wrapper

The only AWS Lambda specific code you need to write is a simple handler like below. All other code you can write as you normally do.

```js
// lambda.js
const { configure } = require('@vendia/serverless-express')
const app = require('./app')
const servererlessExpress = configure({ app })
exports.handler = servererlessExpress.handler
```

## API

### binaryMimeTypes

```js
{
  binaryMimeTypes: ['application/json', 'image/*']
}
```

Specify content types which should be base64 encoded (e.g images or compressed files). Any value you provide here should also be specified on the API Gateway API. In SAM, this looks like:

```yaml
ExpressApi:
  Type: AWS::Serverless::Api
  Properties:
    StageName: prod
    BinaryMediaTypes: ['application/json', 'image/*']
```

### loggerConfig

Provide additional [Winston logger](https://www.npmjs.com/package/winston) configuration. For example, you could add a new transport to emit any errors to a separate CloudWatch Metric or Log Group. `loggerConfig` will be shallow-merged into the default configuration.

```js
// Default:
{
  level: 'warning',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
}
```

### resolutionMode (default: `'PROMISE'`)

Lambda supports three methods to end the execution and return a result: context, callback, and promise. By default, serverless-express uses promise resolution, but you can specify 'CONTEXT' or 'CALLBACK' if you need to change this. If you specify 'CALLBACK', then `context.callbackWaitsForEmptyEventLoop = false` is also set for you.

```js
configure({
  app,
  resolutionMode: 'CALLBACK'
})
```

### respondWithErrors (default: `process.env.NODE_ENV === 'development'`)

Set this to true to have serverless-express include the error stack trace in the event of an unhandled exception. This is especially useful during development. By default, this is enabled when `NODE_ENV === 'development'` so that the stack trace isn't returned in production.

## Advanced API

### eventFns

serverless-express natively supports API Gateway, ALB, and Lambda@Edge. If you want to use Express with other AWS Services integrated with Lambda you can provide your own custom request/response mappings via `eventFns`. See the [custom-mapper-dynamodb example](examples/custom-mapper-dynamodb).

```js
function requestMapper ({ event }) {
  // Your logic here...

  return {
    method,
    path,
    headers
  }
}

function responseMapper ({
  statusCode,
  body,
  headers,
  isBase64Encoded
}) {
  // Your logic here...

  return {
    statusCode,
    body,
    headers,
    isBase64Encoded
  }
}

configure({
  app,
  eventFns: {
    request: requestMapper,
    response: responseMapper
  }
})
```

### logger

Provide a `logger` object with `debug` and `error` methods to override the default [Winston logger](https://www.npmjs.com/package/winston). For example, you could have any error logs also emit to a separate CloudWatch Metric or Log Group, though in most cases you should be able to simply provide `loggerConfig` with additional log transports.

```js
{
  logger: {
    debug: (message, additional) => {/*...*/},
    error: (message, additional) => {/*...*/}
  }
}
```

## Accessing the event and context objects

This package exposes a function to easily get the `event` and `context` objects Lambda receives from the event source.

```js
const { getCurrentLambdaInvoke } = require('@vendia/serverless-express')
app.get('/', (req, res) => {
  const { event, context } = getCurrentLambdaInvoke()

  res.json(event)
})
```

## 4.0.0 Goals

1. ✅ Improved API - Simpler for end user to use and configure; extensible without breaking backwards compatibility or hurting API
2. ✅ Node.js 12+ only - can upgrade dependencies to latest (Jest); can use latest syntax in source and tests; can use server.listening; future-proof for Node.js 10
3. ✅ Promise resolution mode by default
4. ✅ Additional event sources - currently only supports API Gateway Proxy; should also support Lambda@Edge (https://github.com/vendia/serverless-express/issues/152) and ALB; have had a customer request for DynamoDB; should make it easy to provide your own IO mapping function.
   1. Added ALB; requires example refactor.
   2. Need to add Lambda@Edge and example
   3. Need to add example of doing custom resolver (DynamoDB)
5. ✅ Multiple header values - can get rid of set-cookie hack
6. ✅ Configure logging - default winston and allow customers to provide their own; include option to respond to 500s with the stack trace instead of empty string currently
7. ✅Improved documentation
8. ✅ Option to strip base path for custom domains (https://github.com/vendia/serverless-express/issues/86).
9. ✅ Update example to include optional parameter for setting up custom domain

## Is AWS serverless right for my app?

### Benefits

- Pay for what you use
- No infrastructure to manage
- Auto-scaling with no configuration needed
- [Usage Plans](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)
- [Caching](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html)
- [Authorization](http://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)
- [Staging](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-deploy-api.html)
- [SDK Generation](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk.html)
- [API Monitoring](http://docs.aws.amazon.com/apigateway/latest/developerguide/monitoring-cloudwatch.html)
- [Request Validation](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html)
- [Documentation](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-documenting-api.html)

### Considerations

- For apps that may not see traffic for several minutes at a time, you could see [cold starts](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/)
- Cannot use native libraries (aka [Addons](https://nodejs.org/api/addons.html)) unless you package your app on an EC2 machine running Amazon Linux
- Stateless only
- API Gateway has a timeout of 30 seconds, and Lambda has a maximum execution time of 15 minutes.

## Loadtesting

`npx loadtest --rps 100 -k -n 1500 -c 50 https://xxxx.execute-api.us-east-1.amazonaws.com/prod/users`

# AWS Serverless Express has moved

On 11/30, the AWS Serverless Express library moved from AWS to [Vendia](https://github.com/vendia/serverless-express) and will be rebranded to `@vendia/serverless-express`. Similarly, the [`aws-serverless-express` NPM package](https://www.npmjs.com/package/aws-serverless-express) will be deprecated in favor of [@vendia/serverless-express](https://www.npmjs.com/package/@vendia/serverless-express). 

[Brett](https://github.com/brettstack), the original creator of the Serverless Express library, will continue maintaining the repository and give it the attention and care it deserves. At the same time, we will be looking for additional contributors to participate in the development and stewardship of the Serverless Express library. AWS and the [SAM team](https://github.com/aws/aws-sam-cli) will remain involved in an administrative role alongside Vendia, Brett, and the new maintainers that will join the project.

We believe this is the best course of action to ensure that customers using this library get the best possible support in the future. To learn more about this move or become a maintainer of the new Serverless Express library, reach out to us through a GitHub issue on this repository. 

Best,
  The AWS Serverless team, Brett & the Vendia team
# AWS Serverless Express

[![Join the chat at https://gitter.im/awslabs/aws-serverless-express](https://badges.gitter.im/awslabs/aws-serverless-express.svg)](https://gitter.im/awslabs/aws-serverless-express?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/awslabs/aws-serverless-express.svg?branch=master)](https://travis-ci.org/awslabs/aws-serverless-express) [![npm](https://img.shields.io/npm/v/aws-serverless-express.svg)]() [![npm](https://img.shields.io/npm/dm/aws-serverless-express.svg)]() [![dependencies Status](https://david-dm.org/awslabs/aws-serverless-express/status.svg)](https://david-dm.org/awslabs/aws-serverless-express) [![devDependencies Status](https://david-dm.org/awslabs/aws-serverless-express/dev-status.svg)](https://david-dm.org/awslabs/aws-serverless-express?type=dev)

Run serverless applications and REST APIs using your existing [Node.js](https://nodejs.org/) application framework, on top of [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/). The sample provided allows you to easily build serverless web applications/services and RESTful APIs using the [Express](https://expressjs.com/) framework.

## Getting Started

```bash
npm install aws-serverless-express
```

```js
// lambda.js
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const servererlessExpress = awsServerlessExpress.configure({
})

exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }
```

[Package and create your Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html), then configure a simple proxy API using Amazon API Gateway and integrate it with your Lambda function.

## Quick Start/Example

Want to get up and running quickly? [Check out our basic starter example](examples/basic-starter) which includes:

- Lambda function
- Express server [Swagger file](http://swagger.io/specification/)
- [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model)/[CloudFormation](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) template
- Helper scripts to configure, deploy, and manage your application

### Accessing the event and context objects

This package exposes a function to easily get the `event` and `context` objects Lambda receives from the event source.

```js
const { getCurrentLambdaInvoke } = require('aws-serverless-express')
app.get('/', (req, res) => {
  const currentLambdaInvoke = getCurrentLambdaInvoke()

  res.json(currentLambdaInvoke.event)
})
```

## 4.0.0 Goals

1. ✅ Improved API - Simpler for end user to use and configure; extensible without breaking backwards compatibility or hurting API
2. ✅ Node.js 8+ only - can upgrade dependencies to latest (Jest); can use latest syntax in source and tests; can use server.listening; future-proof for Node.js 10
3. 🗓 Promise resolution mode by default? Requires benchmarking. Otherwise try callback with callbackWaitsForEventLoop=false (configurable by user); requires benchmarking. If context.succeed is still most performant, leave as default.
4. 🛠 Additional event sources - currently only supports API Gateway Proxy; should also support Lambda@Edge (https://github.com/awslabs/aws-serverless-express/issues/152) and ALB; have had a customer request for DynamoDB; should make it easy to provide your own IO mapping function.
   1. Added ALB; requires example refactor.
   2. Need to add Lambda@Edge and example
   3. Need to add example of doing custom resolver (DynamoDB)
5. ✅ Multiple header values - can get rid of set-cookie hack
6. ✅ Configure logging - default winston and allow customers to provide their own; include option to respond to 500s with the stack trace instead of empty string currently
7. 🗓Improved documentation
8. ✅ Option to strip base path for custom domains (https://github.com/awslabs/aws-serverless-express/issues/86).
9.  🗓 Update example to include optional parameter for setting up custom domain

### Is AWS serverless right for my app?

#### Benefits

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

#### Considerations

- For apps that may not see traffic for several minutes at a time, you could see [cold starts](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/)
- Cannot use native libraries (aka [Addons](https://nodejs.org/api/addons.html)) unless you package your app on an EC2 machine running Amazon Linux
- Stateless only
- API Gateway has a timeout of 30 seconds, and Lambda has a maximum execution time of 15 minutes.

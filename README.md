# AWS Serverless Express
[![Build Status](https://travis-ci.org/awslabs/aws-serverless-express.svg?branch=master)](https://travis-ci.org/awslabs/aws-serverless-express) [![npm](https://img.shields.io/npm/v/aws-serverless-express.svg)]() [![npm](https://img.shields.io/npm/dm/aws-serverless-express.svg)]()

Run serverless applications and REST APIs using your existing [Node.js](https://nodejs.org/) application framework, on top of [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/). The sample provided allows you to easily build serverless web applications/services and RESTful APIs using the [Express](https://expressjs.com/) framework.

## Getting Started

```bash
npm install aws-serverless-express
```

```js
// lambda.js
'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
```

[Package and create your Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html), then configure a simple proxy API using Amazon API Gateway and integrate it with your Lambda function.

## Quick Start/Example

Want to get up and running quickly? [Check out our example](example) which includes:

 - Lambda function
 - Express server
 [Swagger file](http://swagger.io/specification/)
 - [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model)/[CloudFormation](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) template
 - Helper scripts to configure, deploy, and manage your application

### Getting the API Gateway event object
This package includes middleware to easily get the event object Lambda receives from API Gateway

```js
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
app.use(awsServerlessExpressMiddleware.eventContext())
app.get('/', (req, res) => {
  res.json(req.apiGateway.event)
})
```

### Is AWS serverless right for my app?

#### Pros

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

#### Cons

 - For apps that may not see traffic for several minutes at a time, you could see [cold starts](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/)
 - Cannot use native libraries (aka [Addons](https://nodejs.org/api/addons.html)) unless you package your app on an EC2 machine running Amazon Linux
 - Stateless only
 - API Gateway has a timeout of 30 seconds, and Lambda has a maximum execution time of 5 minutes.

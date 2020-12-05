# AWS Serverless Express is moving

On 11/30, the AWS Serverless Express library is moving to [Vendia](https://github.com/vendia/serverless-express) and will be rebranded to `@vendia/serverless-express`. Similarly, the [`aws-serverless-express` NPM package](https://www.npmjs.com/package/aws-serverless-express) will be deprecated in favor of [@vendia/serverless-express](https://www.npmjs.com/package/@vendia/serverless-express). 

[Brett](https://github.com/brettstack), the original creator of the Serverless Express library, will continue maintaining the repository and give it the attention and care it deserves. At the same time, we will be looking for additional contributors to participate in the development and stewardship of the Serverless Express library. AWS and the [SAM team](https://github.com/aws/aws-sam-cli) will remain involved in an administrative role alongside Vendia, Brett, and the new maintainers that will join the project.

We believe this is the best course of action to ensure that customers using this library get the best possible support in the future. To learn more about this move or become a maintainer of the new Serverless Express library, reach out to us through a GitHub issue on this repository. 

Best,
  The AWS Serverless team, Brett & the Vendia team

---

# Serverless Express

[![npm](https://img.shields.io/npm/v/@vendia/serverless-express.svg)]() [![npm](https://img.shields.io/npm/dm/aws-serverless-express.svg)]() [![dependencies Status](https://david-dm.org/vendia/serverless-express/status.svg)](https://david-dm.org/vendia/serverless-express) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)


Run serverless applications and REST APIs using your existing [Node.js](https://nodejs.org/) application framework, on top of [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/). The sample provided allows you to easily build serverless web applications/services and RESTful APIs using the [Express](https://expressjs.com/) framework.

## Getting Started

```bash
npm install @vendia/serverless-express
```

```js
// lambda.js
'use strict'
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')
const server = serverlessExpress.createServer(app)

exports.handler = (event, context) => { serverlessExpress.proxy(server, event, context) }
```

[Package and create your Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html), then configure a simple proxy API using Amazon API Gateway and integrate it with your Lambda function.

## Quick Start/Example

Want to get up and running quickly? [Check out our basic starter example](examples/basic-starter) which includes:

 - Lambda function
 - Express server
 [Swagger file](http://swagger.io/specification/)
 - [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model)/[CloudFormation](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) template
 - Helper scripts to configure, deploy, and manage your application

### Getting the API Gateway event object
This package includes middleware to easily get the event object Lambda receives from API Gateway

```js
const serverlessExpressMiddleware = require('@vendia/serverless-express/middleware')
app.use(serverlessExpressMiddleware.eventContext())
app.get('/', (req, res) => {
  res.json(req.apiGateway.event)
})
```

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
 - API Gateway has a timeout of 29 seconds, and Lambda has a maximum execution time of 15 minutes.

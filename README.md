This library enables you to utilize [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/) to respond to web and API requests using your existing [Node.js](https://nodejs.org/) application framework. The sample provided allows you to easily build serverless web applications/services and RESTful APIs using the [Express](https://expressjs.com/) framework.

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

## Example

In addition to a basic Lambda function and Express server, the `example` directory includes a [Swagger file](http://swagger.io/specification/), [CloudFormation template](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/), and helper scripts to help you set up and manage your AWS assets.

### Windows support
Windows users must have 7-Zip CLI installed http://www.7-zip.org/download.html and added to their path (`setx path "%path%;C:\Program Files\7-Zip"`) to run the commands. You must also use the `win-` prefixed commands, eg. `npm run win-setup`. If you do not want to install 7-Zip, you can instead zip the necessary files using the Windows UI and modify the commands accordingly.

### Steps for running the example
This guide assumes you have already [set up an AWS account](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html) and have the [AWS CLI](https://aws.amazon.com/cli/) installed.

1. From your preferred project directory: `git clone https://github.com/awslabs/aws-serverless-express.git && cd aws-serverless-express/example`.
2. Run `npm run config <accountId> <bucketName> [region]` to configure the example, eg. `npm run config 123456789012 my-bucket us-west-2`. This modifies `package.json` and  `simple-proxy-api.yaml` with your account ID, bucket, and region (region defaults to `us-east-1`). If the bucket you specify does not yet exist, the next step will create it for you. This step modifies the existing files in-place; if you wish to make changes to these settings, you will need to modify `package.json` and `simple-proxy-api.yaml` manually.
3. Run `npm run setup` (Windows users: `npm run win-setup`) - this installs the node dependencies, creates the S3 bucket (if it does not already exist), packages and uploads your serverless Express application assets to S3, uploads the API Swagger file to S3, and finally spins up a CloudFormation stack, which creates your API Gateway API and Lambda Function.
4. After the setup command completes, open the AWS CloudFormation console https://console.aws.amazon.com/cloudformation/home and switch to the region you specified. Select the `AwsServerlessExpressStack` stack, and wait several minutes for the status to change to `CREATE_COMPLETE`, then click the `ApiUrl` value under the __Outputs__ section - this will open a new page with your running API. The API index lists the resources available in the example Express server (`app.js`), along with example `curl` commands.

See the sections below for details on how to migrate an existing (or create a new) Node.js project based on this example. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the `config` command for step 1 and want to delete that bucket, run `npm run delete-bucket`.

### Creating or migrating a Node.js project based on the example

To use this example as a base for a new Node.js project:

1. Copy the files in the `example` directory into a new project directory (`cp -r ./example ~/projects/my-new-node-project`). If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (you may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. After making updates to `app.js`, simply run `npm run package-upload-update-function` (Windows users: `npm run win-package-upload-update-function`). This will compress `lambda.js`, `app.js`, `index.html`, and your `node_modules` directory into `lambda-function.zip`, upload that zip to S3, and update your Lambda function.

To migrate an existing Node server:

1. Copy the following files from the `example` directory: `api-gateway-event.json`, `cloudformation.json`, `lambda.js`, and `simple-proxy-api.yaml`. Additionally, copy the `scripts` and `config` sections of `example/package.json` into your existing `package.json` - this includes many helpful commands to manage your AWS serverless assets and perform _basic_ local simulation of API Gateway and Lambda. If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (be sure to copy over `configure.js`. You may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. From your existing project directory, run `npm install --save aws-serverless-express`.
3. Modify `lambda.js` to import your own server configuration (eg. change `require('./app')` to `require('./app')`). You will need to ensure you export your app configuration from the necessary file (eg. `module.exports = app`). This library takes your app configuration and listens on a Unix Domain Socket for you, so you can remove your call to `app.listen()` (if you have a `server.listen` callback, you can provide it as the second parameter in the `awsServerlessExpress.createServer` method).
4. Modify the `package-function` script (`win-package-function` for Windows users) in `package.json` to include all files necessary to run your application. If everything you need is in a single child directory, this is as simple as changing `app.js` to `my-app-dir` (also remove `index.html` from that command). If you are using a build tool, you will instead want to add your build output directory to this command.
5. Run `npm run package-upload-update-function` (Windows users: `npm run win-package-upload-update-function`) to package (zip), upload (to S3), and update your Lambda function.

To perform a basic, local simulation of API Gateway and Lambda with your Node server, update `api-gateway-event.json` with some values that are valid for your server (`httpMethod`, `path`, `body` etc.) and run `npm run local`. AWS Lambda uses NodeJS 4.3 LTS, and it is recommended to use the same version for testing purposes.

If you need to make modifications to your API Gateway API, modify `simple-proxy-api.yaml` and run `npm run upload-api-gateway-swagger && npm run update stack`. If your API requires CORS, be sure to modify the two `options` methods defined in the Swagger file, otherwise you can safely remove them. Note: there is currently an issue with updating CloudFormation when it's not obvious that one of its resources has been modified; eg. the Swagger file is an external file hosted on S3. To work around this, simply update one of the resource's properties, such as the `Description` on the `ApiGatewayApi` resource. To modify your other AWS assets, make your changes to `cloudformation.json` and run `npm run update-stack`. Alternatively, you can manage these assets via the AWS console.

### Getting the API Gateway event object
This package includes middleware to easily get the event object Lambda receives from API Gateway

```js
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
app.use(awsServerlessExpressMiddleware.eventContext())
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

#### Cons

 - Currently limited to Node.js 4.3 (LTS)
 - For apps that may not see traffic for several minutes at a time, you could see [cold starts](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/)
 - May be more expensive for high-traffic apps
 - Cannot use native libraries (aka [Addons](https://nodejs.org/api/addons.html)) unless you package your app on an EC2 machine running Amazon Linux
 - Stateless only
 - Multiple headers with same name not supported
 - Currently no support for binary data
 - API Gateway has a timeout of 30 seconds, and Lambda has a maximum execution time of 5 minutes.

This library enables you to utilize [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/) to respond to web and API requests using your existing [Node.js](https://nodejs.org/) application framework. The sample provided allows you to easily build serverless web applications/services and RESTful APIs using the [Express](https://expressjs.com/) framework.

## Getting Started

```bash
npm install aws-serverless-express
```

```js
// lambda.js
'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./express-server')
const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
```

[Package and create your Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html), then configure a simple proxy API using Amazon API Gateway and integrate it with your Lambda function.

## Example

In addition to a basic Lambda function and Express server, the `example` directory includes a [Swagger file](http://swagger.io/specification/), [CloudFormation template](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/), and helper scripts to help you set up and manage your AWS assets.

### Steps for running the example

0. From your preferred project directory: `git clone https://github.com/awslabs/aws-serverless-express.git && cd aws-serverless-express/example`
1. Replace "YOUR_ACCOUNT_ID" in `simple-proxy-api.yaml`: use your preferred text editor, or from Linux|OSX run `sed -i '' 's/YOUR_ACCOUNT_ID/xxxxxxxxxxxx/g' simple-proxy-api.yaml`
2. Replace all instances of "YOUR_UNIQUE_BUCKET_NAME" in the `package.json` `scripts` with a unique S3 bucket name: use your preferred text editor, or from Linux|OSX run `sed -i '' 's/YOUR_UNIQUE_BUCKET_NAME/xxxxxxxxxxxx/g' package.json`. If the bucket does not yet exist, the next step will create it for you.
3. Run `npm run setup` - this installs the node dependencies; creates the S3 bucket (if it does not already exist); packages and uploads your serverless Express application assets to S3; uploads the API Swagger file to S3; and finally spins up a CloudFormation stack, creating your API Gateway API and Lambda Function.
4. After the setup command completes, your browser will be opened to the CloudFormation console (sign in if necessary). Select the `AwsServerlessExpressStack`, and click the `ApiUrl` value under __Outputs__. This should open a new page with your running API. The API index lists the routes available in the example Express server (`express-server.js`).
5. See the sections below for details on how to migrate an existing (or create a new) Node.js project based on this example. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. For safety, this does not delete the S3 bucket, but after verifying the contents of the S3 bucket pointed at by the `delete-bucket` command, you can run `npm run delete-bucket`.

### Creating or migrating a Node.js project based on the example

To use this example as a base for a new Node.js project, simply copy the files in the `example` directory into a new project directory (`cp -r ./example ~/projects/my-new-node-project`). After making updates to `express-server.js`, simply run `npm run package-upload-update-function`. This will compress `lambda.js`, `express-server.js`, `index.html`, and your `node_modules` directory into `lambda-function.zip`, upload that zip to S3, and update your Lambda function.

To migrate an existing Node server, copy the following files from the `example` directory: `api-gateway-event.json`, `cloudformation.json`, `lambda.js`, and `simple-proxy-api.yaml`. Copy the scripts section of `example/package.json` into your existing `package.json` - this includes many helpful commands to manage your AWS serverless assets and perform _basic_ local simulation of API Gateway and Lambda. Modify `lambda.js` to import your server configuration (eg. change `require('./express-server')` to `require('./src/app')`). You will need to ensure you export your app configuration from the necessary file (eg. `module.exports = app`). This library takes your app configuration and listens on a Unix Domain Socket for you, so you can remove your call to `app.listen()` (if you have a `server.listen` callback, you can provide it as the second parameter in the `awsServerlessExpress.createServer` method). Modify the `package-function` script in `package.json` to include all files necessary to run your application. If everything you need is in a single child directory, this is as simple as changing `express-server.js` to `my-app-dir`. If you are using a build tool, you will instead want to add your build output directory to this command. Run `npm run package-upload-update-function` to package (zip), upload (to S3), and update your Lambda function.

To perform a basic, local simulation of API Gateway and Lambda with your Node server, update `api-gateway-event.json` with some values that are valid for your server (`httpMethod`, `path`, etc.) and run `npm run local`. AWS Lambda uses NodeJS 4.3 LTS, and it is recommended to use the same version for testing purposes.

If you need to make modifications to your API Gateway API or other AWS assets, modify `simple-proxy-api.yaml` or `cloudformation.json` respectively, and run `npm run update-stack`. If your API does not require CORS, you can remove the two `options` methods defined in the Swagger file. Alternatively, you can manage these assets via the AWS console.

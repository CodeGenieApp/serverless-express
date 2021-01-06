# Example

In addition to a basic Lambda function and Express server, the `example` directory includes a [Swagger file](http://swagger.io/specification/), [CloudFormation template](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) with [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model), and helper scripts to help you set up and manage your application.

## Steps for running the example

This guide assumes you have already [set up an AWS account](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html) and have the latest version of the [AWS CLI](https://aws.amazon.com/cli/) installed.

1. From your preferred project directory: `git clone https://github.com/vendia/serverless-express.git && cd serverless-express/examples/basic-starter-api-gateway-v2`.
1. Update the `config` section of `package.json` with your `s3BucketName` and `region` (optionally, change the `cloudFormationStackName`). If the bucket you specify does not yet exist, the next step will create it for you.
1. (optional: domain) If you want to use a custom domain name for your application/API, specify it in the `config.domain` section of `package.json`. This example assumes the domain is registered in Route53 in the same account you're deploying the example to.
1. Run `npm run setup` - this installs the node dependencies, creates an S3 bucket (if it does not already exist), packages and deploys your serverless Express application to AWS Lambda, and creates an API Gateway proxy API.
1. (optional: domain) If you specify a domain, the example will create an SSL Certificate via Amazon Certificate Manager; create an API Gateway Domain Name record which maps the domain to the API and Stage; and create a Route53 HostedZone and RecordSet with an A record pointing at the API Gateway Domain Name's CloudFront Distribution.
   1. During deployment you should receive an email at one of the registered email addresses for the domain. Approve the SSL Certificate by clicking the link in the email. The stack creation will pause while waiting for this approval.
   1. Wait for stack creation to complete and update Route53 Domain Name to use the Name Servers from the created Hosted Zone NS Record (don't include the trailing '.') via the AWS console.
   1. It may take several hours before the DNS records propagate.
1. After the setup command completes, open the AWS CloudFormation console https://console.aws.amazon.com/cloudformation/home and switch to the region you specified. Select the `ServerlessExpressStack` stack (or the stack name you specified for `cloudFormationStackName`), then click the `ApiUrl` value under the __Outputs__ section - this will open a new page with your running API. The API index lists the resources available in the example Express server (`app.js`), along with example `curl` commands.
1. (optional) To enable the `invoke-lambda` `package.json` `script`: copy the `LambdaFunctionName` from the CloudFormation Outputs and paste it into the `package.json` `config`'s `functionName` property. Run `npm run invoke-lambda` to invoke the Lambda Function with the payload specified in `api-gateway-event.json`.

See the sections below for details on how to migrate an existing (or create a new) Node.js project based on this example. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the `config` command for step 1 and want to delete that bucket, run `npm run delete-bucket`.

## Creating or migrating a Node.js project based on the example

To use this example as a base for a new Node.js project:

1. Copy the files in the `examples/basic-starter-api-gateway-v2` directory into a new project directory (`cp -r ./examples/basic-starter-api-gateway-v2 ~/projects/my-new-node-project`). If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (you may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. After making updates to `app.js`, simply run `npm run package-deploy`.

To migrate an existing Node server:

1. Copy the following files from this directory: `api-gateway-event.json`, `sam-template.yaml`, and `lambda.js`. Additionally, copy the `scripts` and `config` sections of `example/package.json` into your existing `package.json` - this includes many helpful commands to manage your AWS serverless assets and perform _basic_ local simulation of API Gateway and Lambda. If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example).
2. From your existing project directory, run `npm install --save @vendia/serverless-express`.
3. Modify `lambda.js` to import your own server configuration (eg. change `require('./app')` to `require('./server')`). You will need to ensure you export your app configuration from the necessary file (eg. `module.exports = app`). This library takes your app configuration and listens on a Unix Domain Socket for you, so you can remove your call to `app.listen()`.
4. Modify the `CodeUri` property of the Lambda function resource in `sam-template.yaml` to point to your application directory (e.g. `CodeUri: ./src`). If you are using a build tool (e.g. Gulp, Grunt, Webpack, Rollup, etc.), you will instead want to point to your build output directory.
5. Run `npm run package-deploy`.

To perform a basic, local simulation of API Gateway and Lambda with your Node server, update `api-gateway-event.json` with some values that are valid for your server (`httpMethod`, `path`, `body` etc.) and run `npm run local`.

If you need to make modifications to your API Gateway API or other AWS resources, modify `sam-template.yaml` and run `npm run package-deploy`.

## Node.js version

This example was written against Node.js 12

## Development

To update this example against the latest local changes to @vendia/serverless-express:

```bash
npm i ../..
npm run build
npm run local
```
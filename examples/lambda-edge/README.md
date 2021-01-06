# Lambda@Edge + serverless-express Example

In addition to a basic Lambda function and Express server, this example includes a [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model) template, and helper scripts to help you set up and manage your application.

## Steps for running the example

This guide assumes you have already [set up an AWS account](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html) and have the latest version of the [AWS CLI](https://aws.amazon.com/cli/) installed.

1. From your preferred project directory: `git clone https://github.com/vendia/serverless-express.git && cd serverless-express/examples/lambda-edge`.
2. Update the `config` section of `package.json` with your `s3BucketName` and `region` (optionally, change the `cloudFormationStackName`). If the bucket you specify does not yet exist, the next step will create it for you.
3. Run `npm run setup` - this installs the node dependencies, creates an S3 bucket (if it does not already exist), packages and deploys your serverless Express application to AWS Lambda, and creates an API Gateway proxy API.
4. After the setup command completes, open the AWS CloudFormation console https://console.aws.amazon.com/cloudformation/home and switch to the region you specified. Select the `ServerlessExpressEdge` stack (or the stack name you specified for `cloudFormationStackName`), then click the `ApiUrl` value under the __Outputs__ section - this will open a new page with your running API. The API index lists the resources available in the example Express server (`app.js`), along with example `curl` commands.
5. (optional) To enable the `invoke-lambda` `package.json` `script`: copy the `LambdaFunctionName` from the CloudFormation Outputs and paste it into the `package.json` `config`'s `functionName` property. Run `npm run invoke-lambda` to invoke the Lambda Function with the payload specified in `api-gateway-event.json`.

See the sections below for details on how to migrate an existing (or create a new) Node.js project based on this example. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the `config` command for step 1 and want to delete that bucket, run `npm run delete-bucket`.

## Edge Limitations

Lambda@Edge has several limitations that you should be aware of. These include:

* 1MB code size. As a result, you'll need to use a build tool like Webpack (used in this example). This minimal example with sourcemaps comes in at ~380KB after bundling/minification/zip.
* 40KB Response body size (53.2KB for base64 encoded body).
* 128MB Function RAM allocation.

* https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html
* https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html

## Development

To update this example against the latest local changes to serverless-express:

```bash
npm pack ../..
npm install ./vendia-serverless-express-4.0.0-rc.1.tgz
npm install
npm run build
npm run local
```

## TODO:

Test using origin-request event. origin-* events have fewer limitations, however, we likely lose most advantages of edge-compute since it needs to go to the origin on each request. We will also need to force the object to never be cached.

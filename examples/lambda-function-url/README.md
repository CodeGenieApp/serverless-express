## Pre-requisites

* [AWS Account + CLI](https://docs.aws.amazon.com/polly/latest/dg/setup-aws-cli.html)
* Node.js

## Getting started

Run `npm run init:dev` to deploy a developer instance to your AWS account. This command does the following:

1. Installs NPM dependencies (`npm i`)
1. Creates a new entry in `~/.aws/credentials` called `todo_development` using credentials copied from the `default` profile.
   * If you'd rather copy credentials from a different profile, run `COPY_AWS_PROFILE=profile-name-to-copy npm run init:dev`, or if you'd rather not copy any credentials, run `COPY_AWS_PROFILE=0 npm run init:dev` (this requires you to manually define a profile named `todo_development`).
1. Bootstraps CDK in the AWS account (`npm run cdk-bootstrap:dev`)
1. Deploys to AWS (`npm run deploy:dev`)
   * Since the UI has a dependency on Cognito and the API, this setup command actually runs deploy a second time.
1. Copies CloudFormation/CDK outputs to local `.env` files for running the UI and API locally.
1. Opens the live version of the web app.

## Developing

After deploying to your developer AWS account, start the UI locally with:

```
npm run start-ui:dev
```

If you want to run your UI against a local version of your API, instead run these two commands in separate terminals:

```
npm run start-api:dev
```

```
npm run start-ui-local-api:dev
```

Note that this will still use your other cloud resources (e.g. Database and Auth) but allows you to quickly iterate on your UI and API.

## Pull outputs

Note that sometimes when you receive a CDK/CloudFormation error (e.g. after a CloudFormation rollback), the `cdk-outputs.json` file gets wiped and you need to re-run `npm run pull-stack-outputs:dev`.
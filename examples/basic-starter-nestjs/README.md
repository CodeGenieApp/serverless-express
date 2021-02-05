# Basic Starter for NestJS

## Description

This is an example of how to use serverless-express with [NestJS](https://github.com/nestjs/nest) on AWS using the [Serverless framework](https://www.serverless.com/).

## Installation

```bash
$ npm install
```

## Development

To simulate the app running on Lambda locally, run the following:

```bash
$ npm run sls:offline
```

The application will be available at `http://localhost:3000/dev/hello`.

## Deployment the app

To deploy the app to AWS, you'll first need to configure your AWS credentials. There are many ways
to set your credentials, for more information refer to the [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html).

Once set you can deploy your app using the serverless framework with:

```bash
$ npm run sls:deploy
```

import { CfnOutput, Duration, Fn } from 'aws-cdk-lib'
import {
  ClientAttributes,
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolEmail,
  UserPoolOperation,
} from 'aws-cdk-lib/aws-cognito'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { ITable } from 'aws-cdk-lib/aws-dynamodb'
import {
  getEnvironmentConfig,
  getEnvironmentName,
  getIsDeletionProtectionEnabled,
  getRemovalPolicy,
} from '../environment-config'
import CustomNodejsFunction from './CustomNodejsFunction'
import type { StringMap } from '../../../common/types'
import path from 'node:path'

const cognitoPackageDir = path.resolve(import.meta.dirname, '../../../cognito')

interface AuthProps {
  userTable: ITable
}

export default class Auth extends Construct {
  readonly userPool: UserPool
  readonly userPoolClient: UserPoolClient
  readonly cognitoPreSignupFunction: NodejsFunction
  readonly cognitoPreTokenGenerationFunction: NodejsFunction
  readonly cognitoCustomMessageFunction: NodejsFunction
  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id)

    this.userPool = this.createUserPool()
    this.userPoolClient = this.createUserPoolClient()
    const {
      cognitoPreSignupFunction,
      cognitoPreTokenGenerationFunction,
      cognitoCustomMessageFunction,
    } = this.addTriggers({ userTable: props.userTable })
    this.cognitoPreSignupFunction = cognitoPreSignupFunction
    this.cognitoPreTokenGenerationFunction = cognitoPreTokenGenerationFunction
    this.cognitoCustomMessageFunction = cognitoCustomMessageFunction
  }

  createUserPool() {
    const environmentConfig = getEnvironmentConfig(this.node)

    // NOTE: If `verifyUserEmail` isn't set, use the built-in Cognito emailer. This is especially convenient for dev environments.
    const userPoolWithSesEmail = environmentConfig.email?.verifiedDomain && environmentConfig.email.verifyUserEmail ? UserPoolEmail.withSES({
      sesVerifiedDomain: environmentConfig.email.verifiedDomain,
      fromEmail: environmentConfig.email.verifyUserEmail,
      fromName: 'Todo',
    }) : undefined

    const userPool = new UserPool(this, 'UserPool', {
      signInCaseSensitive: false,
      deletionProtection: getIsDeletionProtectionEnabled({ node: this.node }),
      removalPolicy: getRemovalPolicy({ node: this.node }),
      passwordPolicy: {
        minLength: 8,
      },
      selfSignUpEnabled: true,
      signInAliases: {
        username: false,
        email: true,
      },
      email: userPoolWithSesEmail,
      customAttributes: {
        'userId': new StringAttribute({
          mutable: true,
        }),
      },
    })

    new CfnOutput(this, 'UserPoolId', { key: 'UserPoolId', value: userPool.userPoolId })

    return userPool
  }

  createUserPoolClient() {
    // NOTE: Cognito grants read and write permission to all attributes by default,
    // enabling users to update potentially restricted data such as their userId.
    // Restrict to only necessary attributes, including those required by IDP mappings.
    const readAttributes = (new ClientAttributes()).withStandardAttributes({
      email: true,
      fullname: true,
      familyName: true,
      givenName: true,
      profilePicture: true,
    })
    const writeAttributes = (new ClientAttributes()).withStandardAttributes({
      email: true,
      fullname: true,
      familyName: true,
      givenName: true,
      profilePicture: true,
    })

    const userPoolClient = this.userPool.addClient('UserPoolClient', {
      idTokenValidity: Duration.days(1),
      refreshTokenValidity: Duration.days(90),
      readAttributes,
      writeAttributes,
    })

    new CfnOutput(this, 'UserPoolClientId', { key: 'UserPoolClientId', value: userPoolClient.userPoolClientId })

    return userPoolClient
  }

  addTriggers({ userTable }: { userTable: ITable }) {
    const cognitoPreSignupFunction = this.addPreSignupTrigger()
    const cognitoPreTokenGenerationFunction = this.addPreTokenGenerationTrigger({ userTable })
    const cognitoCustomMessageFunction = this.addCustomMessageTrigger()
    return {
      cognitoPreSignupFunction,
      cognitoPreTokenGenerationFunction,
      cognitoCustomMessageFunction,
    }
  }

  // Pre Signup https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-sign-up.html
  addPreSignupTrigger() {
    const { auth } = getEnvironmentConfig(this.node)
    const environment: StringMap = {}

    if (auth?.autoVerifyUsers) {
      environment.AUTO_VERIFY_USERS = '1'
    }

    const cognitoPreSignupFunction = new CustomNodejsFunction(this, 'PreSignupFunction', {
      function: {
        entry: path.join(cognitoPackageDir, 'cognito-pre-signup.ts'),
        environment,
      },
    }).function
    this.userPool.addTrigger(UserPoolOperation.PRE_SIGN_UP, cognitoPreSignupFunction)
    return cognitoPreSignupFunction
  }

  addPreTokenGenerationTrigger({ userTable }: { userTable: ITable }) {
    // Pre Token Generation https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-token-generation.html
    const environment: StringMap = {
      USER_TABLE: userTable.tableName,
    }

    const cognitoPreTokenGenerationFunction = new CustomNodejsFunction(this, 'PreTokenGenerationFunction', {
      function: {
        entry: path.join(cognitoPackageDir, 'cognito-pre-token-generation.ts'),
        environment,
      },
    }).function

    // Give the Lambda function permission to read and write to DynamoDB
    const dynamoDBReadWritePolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
      ],
      resources: [
        userTable.tableArn,
      ],
    })
    cognitoPreTokenGenerationFunction.addToRolePolicy(dynamoDBReadWritePolicy)
    this.userPool.addTrigger(UserPoolOperation.PRE_TOKEN_GENERATION, cognitoPreTokenGenerationFunction)

    return cognitoPreTokenGenerationFunction
  }

  addCustomMessageTrigger() {
    // Custom message https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-custom-message.html
    const cognitoCustomMessageFunction = new CustomNodejsFunction(this, 'CustomMessageFunction', {
      function: {
        entry: path.join(cognitoPackageDir, 'cognito-custom-message.ts'),
      },
    }).function
    this.userPool.addTrigger(UserPoolOperation.CUSTOM_MESSAGE, cognitoCustomMessageFunction)

    return cognitoCustomMessageFunction
  }
}
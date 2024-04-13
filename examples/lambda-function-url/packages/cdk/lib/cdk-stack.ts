import { Aws, CfnOutput, Stack, StackProps} from 'aws-cdk-lib/core'
import { Construct } from 'constructs'
import ExpressApi from './constructs/ExpressApi'
import Auth from './constructs/Auth'
import WebApp from './constructs/WebApp'
import TodoListTable from './constructs/tables/TodoListTable'
import TodoItemTable from './constructs/tables/TodoItemTable'
import UserTable from './constructs/tables/UserTable'
import Budget from './constructs/Budget'
import Monitoring from './constructs/Monitoring'

export default class TodoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const todoListTable = new TodoListTable(this, 'TodoListTable')
    const todoItemTable = new TodoItemTable(this, 'TodoItemTable')
    const userTable = new UserTable(this, 'UserTable')
    const webApp = new WebApp(this, 'WebApp')
    const auth = new Auth(this, 'Auth', {
      userTable: userTable.table,
    })
    const expressApi = new ExpressApi(this, 'ExpressApi', {
      auth,
      todoListTable: todoListTable.table,
      todoItemTable: todoItemTable.table,
      userTable: userTable.table,
    })
    new Budget(this, 'Budget')
    
    new Monitoring(this, 'CodeGenieDevelopmentMonitoring', {
      userPoolId: auth.userPool.userPoolId,
      userPoolClientId: auth.userPoolClient.userPoolClientId,
      amplifyApp: webApp.amplifyApp,
      api: expressApi.api,
      functions: [
        expressApi.lambdaFunction,
        auth.cognitoPreSignupFunction,
        auth.cognitoPreTokenGenerationFunction,
        auth.cognitoCustomMessageFunction,
      ],
      tables: [
        todoListTable.table,
        todoItemTable.table,
        userTable.table,
      ],
    })

    new CfnOutput(this, 'Region', { key: 'Region', value: Aws.REGION })
  }
}
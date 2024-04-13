/* eslint @typescript-eslint/no-var-requires: 0 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const { ENVIRONMENT } = process.env

if (!ENVIRONMENT) {
  throw new Error('No ENVIRONMENT environment variable defined')
}

const nodeEnv = ENVIRONMENT === 'development' ? 'development' : 'production'
const outputs = await import(`../cdk-outputs.${ENVIRONMENT}.json`)

if (!outputs) {
  const envShort = ENVIRONMENT === 'development' ? 'dev'
    : ENVIRONMENT === 'production' ? 'prod'
      : ENVIRONMENT
  throw new Error(`No cdk-outputs.${ENVIRONMENT}.json. Try running \`npm run pull-stack-outputs:${envShort}\``)
}

const cdkJson: any = await import('../cdk.json')
const cdkJsonEnvironmentConfig = cdkJson.context.environmentConfig[ENVIRONMENT]
const stackOutputs = outputs[`Todo-${ENVIRONMENT}`]
const SECRET_WARNING = `# WARNING: This file is committed to source control. Store secrets in .env.${ENVIRONMENT}.local instead of here.`
const apiDotEnv = `${SECRET_WARNING}
NODE_ENV=${nodeEnv}
TODO_LIST_TABLE="${stackOutputs.TodoListTable}"
TODO_ITEM_TABLE="${stackOutputs.TodoItemTable}"
USER_TABLE="${stackOutputs.UserTable}"`

writeFileSync(path.resolve(import.meta.dirname, `../../api/.env.${ENVIRONMENT}`), apiDotEnv)

let uiDotEnv = `NEXT_PUBLIC_ApiEndpoint="${stackOutputs.ApiEndpoint}"
NEXT_PUBLIC_CognitoUserPoolId="${stackOutputs.UserPoolId}"
NEXT_PUBLIC_CognitoUserPoolClientId="${stackOutputs.UserPoolClientId}"
NEXT_PUBLIC_Region="${stackOutputs.Region}"
AMPLIFY_URL="${stackOutputs.AmplifyUrl}"`

if (cdkJsonEnvironmentConfig.auth?.autoVerifyUsers) {
  uiDotEnv = `NEXT_PUBLIC_AUTO_VERIFY_USERS=1
${uiDotEnv}`
}

uiDotEnv = `${SECRET_WARNING}
${uiDotEnv}`

writeFileSync(path.resolve(import.meta.dirname, `../../ui/.env/.env.${ENVIRONMENT}`), uiDotEnv)

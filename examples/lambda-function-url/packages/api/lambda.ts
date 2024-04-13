import serverlessExpress from '@codegenie/serverless-express'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import app from './app'
import { log, addLogMetadata } from './utils/logger'
const serverlessExpressInstance = serverlessExpress({
  app,
  // log,
})

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {
  addLogMetadata({ metadata: { awsRequestId: context.awsRequestId } })
  return serverlessExpressInstance(event, context)
}

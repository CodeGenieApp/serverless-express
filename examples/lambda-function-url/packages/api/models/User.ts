import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { USER_TABLE } from '../config'

assertHasRequiredEnvVars(['USER_TABLE'])

export const UserTable = new DynamoDbToolbox.Table({
  name: USER_TABLE,
  partitionKey: 'userId',
  DocumentClient: dynamoDbDocumentClient,
})

const User = new DynamoDbToolbox.Entity({
  name: 'User',
  attributes: {
    userId: {
      partitionKey: true,
    },
    name: 'string',
    email: 'string',
    profilePicture: 'string',
  },
  table: UserTable,
})

export default User

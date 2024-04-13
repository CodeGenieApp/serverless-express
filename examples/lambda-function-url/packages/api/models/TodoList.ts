import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { TODO_LIST_TABLE } from '../config'

assertHasRequiredEnvVars(['TODO_LIST_TABLE'])

export const TodoListTable = new DynamoDbToolbox.Table({
  name: TODO_LIST_TABLE,
  partitionKey: 'listId',
  DocumentClient: dynamoDbDocumentClient,
})

const TodoList = new DynamoDbToolbox.Entity({
  name: 'TodoList',
  attributes: {
    listId: {
      partitionKey: true,
    },
    name: 'string',
  },
  table: TodoListTable,
})

export default TodoList

import * as DynamoDbToolbox from 'dynamodb-toolbox'
import { assertHasRequiredEnvVars } from '@/common/required-env-vars'
import { dynamoDbDocumentClient } from '../utils/dynamodb'
import { TODO_ITEM_TABLE } from '../config'

assertHasRequiredEnvVars(['TODO_ITEM_TABLE'])

export const TodoItemTable = new DynamoDbToolbox.Table({
  name: TODO_ITEM_TABLE,
  partitionKey: 'listId',
  sortKey: 'itemId',
  DocumentClient: dynamoDbDocumentClient,
})

const TodoItem = new DynamoDbToolbox.Entity({
  name: 'TodoItem',
  attributes: {
    listId: {
      partitionKey: true,
    },
    itemId: {
      sortKey: true,
    },
    title: 'string',
    description: 'string',
    completed: 'boolean',
    dueDate: 'string',
    image: 'string',
  },
  table: TodoItemTable,
})

export default TodoItem

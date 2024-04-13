import { Filter } from '@/common/filter'
import TodoList from '../models/TodoList'
import { generateId } from '../utils/id'
import { log } from '../utils/logger'
import { dynamoCreateItem, getAttributesWithout, scanAll } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '../../common/pagination'

const READ_ONLY_ATTRIBUTES = [
  'listId',
]
const IMMUTABLE_ATTRIBUTES = [...READ_ONLY_ATTRIBUTES]

export async function createTodoList({
  todoList,
  listId = generateId(),
}) {
  const attributes = getAttributesWithout({ attributes: todoList, without: READ_ONLY_ATTRIBUTES })
  attributes.listId = listId

  await dynamoCreateItem({
    entity: TodoList,
    attributes,
  })

  log.info('api.controller.TodoList.create', { attributes })

  return { data: attributes }
}

export async function updateTodoList({
  listId,
  todoList,
}) {
  const attributes = getAttributesWithout({ attributes: todoList, without: IMMUTABLE_ATTRIBUTES })
  attributes.listId = listId
  const todoListItem = await TodoList.update(attributes, { returnValues: 'ALL_NEW' })

  log.info('api.controller.TodoList.update', { todoListItem })

  return todoListItem.Attributes
}

export async function getTodoList({
  listId,
}) {
  const todoList = await TodoList.get({ listId })
  const todoListItem = todoList?.Item

  if (!todoListItem) return null

  const data = todoListItem

  return { data }
}

export interface ListTodoListsLastEvaluatedKey {
  listId: string
}

interface ListTodoListsParams {
  lastEvaluatedKey?: ListTodoListsLastEvaluatedKey
  filter?: Filter
}

export async function listTodoLists({
  lastEvaluatedKey,
  filter,
}: ListTodoListsParams = {}) {
  const todoListScanResponse = await scanAll({
    entity: TodoList,
    scanOptions: {
      startKey: lastEvaluatedKey,
    },
    maxItems: DEFAULT_PAGE_SIZE,
    maxPages: 10,
    filter,
  })

  return {
    data: todoListScanResponse.Items,
    lastEvaluatedKey: todoListScanResponse.LastEvaluatedKey,
  }
}

export async function deleteTodoList({
  listId,
}) {
  const itemToDeleteKey = { listId }

  const todoList = await TodoList.get(itemToDeleteKey)

  if (!todoList) return null

  return TodoList.delete(itemToDeleteKey)
}

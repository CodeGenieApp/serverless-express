import { Filter } from '@/common/filter'
import TodoItem from '../models/TodoItem'
import TodoList, { TodoListTable } from '../models/TodoList'
import { generateId } from '../utils/id'
import { log } from '../utils/logger'
import { dynamoCreateItem, getAttributesWithout } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '../../common/pagination'

const READ_ONLY_ATTRIBUTES = [
  'itemId',
  'listId',
]
const IMMUTABLE_ATTRIBUTES = [...READ_ONLY_ATTRIBUTES]

export async function createTodoItem({
  todoItem,
  listId,
  itemId = todoItem.itemId || generateId(),
}) {
  const attributes = getAttributesWithout({ attributes: todoItem, without: READ_ONLY_ATTRIBUTES })
  attributes.listId = listId
  attributes.itemId = itemId

  await dynamoCreateItem({
    entity: TodoItem,
    attributes,
  })

  log.info('api.controller.TodoItem.create', { attributes })

  return { data: attributes }
}

export async function updateTodoItem({
  listId,
  itemId,
  todoItem,
}) {
  const attributes = getAttributesWithout({ attributes: todoItem, without: IMMUTABLE_ATTRIBUTES })
  attributes.listId = listId
  attributes.itemId = itemId
  const todoItemItem = await TodoItem.update(attributes, { returnValues: 'ALL_NEW' })

  log.info('api.controller.TodoItem.update', { todoItemItem })

  return todoItemItem.Attributes
}

export async function getTodoItem({
  listId,
  itemId,
}) {
  const todoItem = await TodoItem.get({ listId, itemId })
  const todoItemItem = todoItem?.Item

  if (!todoItemItem) return null

  const data = todoItemItem
  const todoList = todoItemItem.listId ? await TodoList.get({ listId: todoItemItem.listId }) : null
  
  // @ts-ignore
  data.todoList = todoList?.Item

  return { data }
}

export interface ListTodoItemsLastEvaluatedKey {
  listId: string
}

interface ListTodoItemsParams {
  lastEvaluatedKey?: ListTodoItemsLastEvaluatedKey
  filter?: Filter
  listId: string
}

export async function listTodoItems({
  lastEvaluatedKey,
  filter,
  listId,
}: ListTodoItemsParams) {
  const todoItemQueryResponse = await TodoItem.query(listId, { limit: DEFAULT_PAGE_SIZE, startKey: lastEvaluatedKey })
  const todoItemQueryResponseItems = todoItemQueryResponse?.Items || []
  const todoItemsListIds = todoItemQueryResponseItems.map(todoItem => todoItem.listId).filter(Boolean)

  if (!todoItemsListIds.length) {
    return {
      data: todoItemQueryResponseItems,
      lastEvaluatedKey: todoItemQueryResponse.LastEvaluatedKey,
    }
  }

  const uniqueTodoItemsListIds = Array.from(new Set(todoItemsListIds))
  const todoItemsListsBatchGetOperations = uniqueTodoItemsListIds.map(todoItemListId => TodoList.getBatch({ listId: todoItemListId }))

  const todoItemsLists = todoItemsListsBatchGetOperations.length ? await TodoListTable.batchGet(todoItemsListsBatchGetOperations) : null

  const todoItems = todoItemQueryResponseItems.map(todoItem => {
    const list = todoItem.listId ? todoItemsLists?.Responses[TodoListTable.name].find(todoItemList => todoItemList.listId === todoItem.listId) : null

    return {
      ...todoItem,
      list,
    }
  })

  return {
    data: todoItems,
    lastEvaluatedKey: todoItemQueryResponse.LastEvaluatedKey,
  }
}

export async function deleteTodoItem({
  listId,
  itemId,
}) {
  const itemToDeleteKey = { listId, itemId }

  const todoItem = await TodoItem.get(itemToDeleteKey)

  if (!todoItem) return null

  return TodoItem.delete(itemToDeleteKey)
}

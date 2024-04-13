import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import {
  listTodoItems,
  getTodoItem,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  ListTodoItemsLastEvaluatedKey,
} from '../controllers/todo-item'
import type { Filter } from '@/common/filter'

const todoItemRouter = asyncify(Router({ mergeParams: true }))

todoItemRouter.get('/todo-lists/:listId/todo-items', async (req, res) => {
  const { listId } = req.params
  const lastEvaluatedKeyParsed: ListTodoItemsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const todoItems = await listTodoItems({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
    listId,
  })

  res.json(todoItems)
})

todoItemRouter.get('/todo-lists/:listId/todo-items/:itemId', async (req, res) => {
  const { listId, itemId } = req.params
  const todoItem = await getTodoItem({
    listId,
    itemId,
  })

  if (!todoItem) {
    return res
      .status(404)
      .json({})
  }

  return res.json(todoItem)
})

todoItemRouter.post('/todo-lists/:listId/todo-items', async (req, res) => {
  const { todoItem } = req.body
  const { listId } = req.params
  const createdTodoItem = await createTodoItem({
    listId,
    todoItem,
  })

  res.json(createdTodoItem)
})

todoItemRouter.put('/todo-lists/:listId/todo-items/:itemId', async (req, res) => {
  const { listId, itemId } = req.params
  const { todoItem } = req.body
  const todoItemItem = await updateTodoItem({
    listId,
    itemId,
    todoItem,
  })

  res.json({ data: todoItemItem })
})

todoItemRouter.delete('/todo-lists/:listId/todo-items/:itemId', async (req, res) => {
  const { listId, itemId } = req.params
  const result = await deleteTodoItem({
    listId,
    itemId,
  })

  if (!result) {
    return res
      .status(404)
      .json({})
  }

  return res.json({})
})

export default todoItemRouter

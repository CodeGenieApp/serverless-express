import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import {
  listTodoLists,
  getTodoList,
  createTodoList,
  updateTodoList,
  deleteTodoList,
  ListTodoListsLastEvaluatedKey,
} from '../controllers/todo-list'
import type { Filter } from '@/common/filter'

const todoListRouter = asyncify(Router({ mergeParams: true }))

todoListRouter.get('/todo-lists', async (req, res) => {
  const lastEvaluatedKeyParsed: ListTodoListsLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const todoLists = await listTodoLists({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
  })

  res.json(todoLists)
})

todoListRouter.get('/todo-lists/:listId', async (req, res) => {
  const { listId } = req.params
  const todoList = await getTodoList({
    listId,
  })

  if (!todoList) {
    return res.status(404).json({})
  }

  return res.json(todoList)
})

todoListRouter.post('/todo-lists', async (req, res) => {
  const { todoList } = req.body
  const createdTodoList = await createTodoList({
    todoList,
  })

  res.json(createdTodoList)
})

todoListRouter.put('/todo-lists/:listId', async (req, res) => {
  const { listId } = req.params
  const { todoList } = req.body
  const todoListItem = await updateTodoList({
    listId,
    todoList,
  })

  res.json({ data: todoListItem })
})

todoListRouter.delete('/todo-lists/:listId', async (req, res) => {
  const { listId } = req.params
  const result = await deleteTodoList({
    listId,
  })

  if (!result) {
    return res.status(404).json({})
  }

  return res.json({})
})

export default todoListRouter

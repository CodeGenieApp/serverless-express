import { Router } from 'express'
import asyncify from 'express-asyncify'
import tryParseReq from '../try-parse-req'
import {
  listUsers,
  getUser,
  ListUsersLastEvaluatedKey,
} from '../controllers/user'
import type { Filter } from '@/common/filter'

const userRouter = asyncify(Router({ mergeParams: true }))

userRouter.get('/users', async (req, res) => {
  const lastEvaluatedKeyParsed: ListUsersLastEvaluatedKey | undefined = tryParseReq({ req, res, key: 'lastEvaluatedKey' })
  const filterParsed: Filter | undefined = tryParseReq({ req, res, key: 'filter' })
  const users = await listUsers({
    lastEvaluatedKey: lastEvaluatedKeyParsed,
    filter: filterParsed,
  })

  res.json(users)
})

userRouter.get('/users/:userId', async (req, res) => {
  const { userId } = req.params
  const user = await getUser({
    userId,
  })

  if (!user) {
    return res
      .status(404)
      .json({})
  }

  return res.json(user)
})

export default userRouter

import { Router } from 'express'
import asyncify from 'express-asyncify'
import { getCurrentUser, updateUser } from '../controllers/user'

const meRouter = asyncify(Router({ mergeParams: true }))

meRouter.get('/me', async (req, res) => {
  const user = await getCurrentUser(req)
  res.json(user)
})

meRouter.put('/me', async (req, res) => {
  const { me } = req.body

  const userItem = await updateUser({
    userId: req.cognitoUser.userId,
    user: me,
  })

  res.json({ data: userItem })
})

export default meRouter

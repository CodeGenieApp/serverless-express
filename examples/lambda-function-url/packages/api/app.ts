import express, { Router, json } from 'express'
import cors from 'cors'
import { getCurrentInvoke } from '@codegenie/serverless-express'
import { StatusCodes } from 'http-status-codes'
import todoListRouter from './routes/todo-list'
import todoItemRouter from './routes/todo-item'
import userRouter from './routes/user'
import meRouter from './routes/me'

import {
  NotFoundError,
  UnauthenticatedError,
  UserInputError,
  BadRequestError,
} from './errors'
import { log } from './utils/logger'
import { IS_PRODUCTION } from './config'

const app = express()
const router = Router()
router.use(cors())
router.use(json())

router.use((req, res, next) => {
  const { event = {} } = getCurrentInvoke()

  // Handle Cognito auth for local development
  if (process.env.IS_LOCAL === '1' && !event?.requestContext?.authorizer) {
    if (!event.requestContext) event.requestContext = {}
    const parseJwt = (token) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    event.requestContext.authorizer = {
      jwt: {
        claims: parseJwt(req.headers.authorization),
      },
    }
  }

  const { claims } = event.requestContext.authorizer.jwt

  if (!claims || !claims.email || !claims.userId) {
    throw new UnauthenticatedError()
  }

  const { userId, email } = claims
  const groups = claims['cognito:groups']
  req.cognitoUser = {
    userId,
    email,
    groups,
  }
  next()
  
  // NOTE: An alternative to using pre-token-generation and adding orgId to claimsToAddOrOverride
  // is to instead query for the current user here and grab the orgId. The problem with the pre-token-generation
  // approach is that after a user accepts an org invite, the token still reflects the previous orgId.
  // This is currently addressed by forcing a client-side logout upon accepting an invitation, but has issues such as:
  // 1: User must sign back in; 2: Other devices the user is signed in on will be stale until the user sign out and back in, or the token expires.
  // However, the downside of this alternative approach is it adds an additional query for EVERY API call.
  // const currentUser = await getCurrentUser(req)
})

app.use('/', router)
app.use('/', meRouter)
app.use(todoListRouter)
app.use(todoItemRouter)
app.use(userRouter)

app.use((req, res, next) => {
  const error: Error & {statusCode?} = new Error('Route not found')
  error.statusCode = 404
  next(error)
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const { statusCode = 500 } = error
  const response: {message, trace?} = {
    message: error.message,
  }

  if (!IS_PRODUCTION) {
    response.trace = error.stack
  }

  if (error instanceof UserInputError) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: error.errors })
  } else if (error instanceof UnauthenticatedError) {
    res.status(StatusCodes.UNAUTHORIZED).json()
  } else if (error instanceof BadRequestError) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })
  } else if (error instanceof NotFoundError) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
  } else {
    res
      .status(statusCode)
      .json(response)
  }

  log.error(`An error occurred while processing ${req.method}: ${req.originalUrl} API`)
  log.error(error)
})

export default app

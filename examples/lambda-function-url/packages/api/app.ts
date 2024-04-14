import express, { Router, json } from 'express'
import cors from 'cors'
import { getCurrentInvoke } from '@codegenie/serverless-express'
import { StatusCodes } from 'http-status-codes'
import todoListRouter from './routes/todo-list'
import todoItemRouter from './routes/todo-item'
import userRouter from './routes/user'
import meRouter from './routes/me'

import { NotFoundError, UnauthenticatedError, UserInputError, BadRequestError } from './errors'
import { log } from './utils/logger'
import { IS_PRODUCTION } from './config'
import { idTokenVerifier } from './utils/cognito'
import asyncify from 'express-asyncify'

const app = asyncify(express())
app.use(
  cors({
    maxAge: 86400,
  })
)
app.use(json())
app.use(async (req, res, next) => {
  const { event = {} } = getCurrentInvoke()
  // NOTE: APIGW sets event.requestContext.authorizer when using an Authorizer
  // If one isn't set, this function is either being invoked locally or through Lambda Function URL
  let jwtClaims = event.requestContext?.authorizer?.claims
  if (!jwtClaims) {
    console.time('time_to_validate_jwt')
    if (!req.headers.authorization) {
      console.error('Missing Authorization header')
      console.timeEnd('time_to_validate_jwt')
      throw new UnauthenticatedError()
    }
    try {
      jwtClaims = await idTokenVerifier.verify(req.headers.authorization)
    } catch (error) {
      console.error('error while validating token', error)
      console.timeEnd('time_to_validate_jwt')
      throw new UnauthenticatedError()
    }
    console.timeEnd('time_to_validate_jwt')
  }

  if (!jwtClaims || !jwtClaims.email || !jwtClaims.userId) {
    throw new UnauthenticatedError()
  }

  const { userId, email } = jwtClaims
  const groups = jwtClaims['cognito:groups']
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

app.use(meRouter)
app.use(todoListRouter)
app.use(todoItemRouter)
app.use(userRouter)

app.use((req, res, next) => {
  const error: Error & { statusCode? } = new Error('Route not found')
  error.statusCode = 404
  next(error)
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const { statusCode = 500 } = error
  const response: { message; trace? } = {
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
    res.status(statusCode).json(response)
  }

  log.error(`An error occurred while processing ${req.method}: ${req.originalUrl} API`)
  log.error(error)
})

export default app

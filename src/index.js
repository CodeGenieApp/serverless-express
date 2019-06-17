/*
 * Copyright 2016-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file.
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
const http = require('http')
const { createLogger, format, transports } = require('winston')
const {
  forwardRequestToNodeServer,
  startServer,
  makeResolver,
  getSocketPath
} = require('./transport')
const {
  getRandomString
} = require('./utils')
const {
  getEventFnsBasedOnEventSource
} = require('./event-mappings')
const {
  getEventSourceBasedOnEvent
} = require('./event-mappings/utils')

const currentLambdaInvoke = {}

function getCurrentLambdaInvoke () {
  return currentLambdaInvoke
}

function setCurrentLambdaInvoke ({ event, context }) {
  currentLambdaInvoke.event = event
  currentLambdaInvoke.context = context
}

function createServer ({
  app,
  binaryMimeTypes,
  logger
}) {
  logger.debug('Creating HTTP server based on app...', { app, binaryMimeTypes })
  const server = http.createServer(app)

  server._socketPathSuffix = getRandomString()
  server._binaryMimeTypes = binaryMimeTypes ? [...binaryMimeTypes] : []
  logger.debug('Created HTTP server', { server })
  server.on('error', (error) => {
    /* istanbul ignore else */
    if (error.code === 'EADDRINUSE') {
      logger.warn(`Attempting to listen on socket ${getSocketPath({ socketPathSuffix: server._socketPathSuffix })}, but it's already in use. This is likely as a result of a previous invocation error or timeout. Check the logs for the invocation(s) immediately prior to this for root cause. If this is purely as a result of a timeout, consider increasing the function timeout and/or cpu/memory allocation. aws-serverless-express will restart the Node.js server listening on a new port and continue with this request.`)
      server._socketPathSuffix = getRandomString()
      return server.close(() => startServer({ server }))
    } else {
      logger.error('aws-serverless-express server error: ', error)
    }
  })

  return server
}

function proxy ({
  server,
  event = {},
  context = {},
  callback = null,
  resolutionMode = 'CONTEXT_SUCCEED',
  eventSource = getEventSourceBasedOnEvent({ event }),
  eventFns = getEventFnsBasedOnEventSource({ eventSource }),
  logger,
  respondWithErrors
}) {
  logger.debug('Calling proxy', { event, context, resolutionMode, eventSource })
  setCurrentLambdaInvoke({ event, context })
  return new Promise((resolve, reject) => {
    const promise = {
      resolve,
      reject
    }
    const resolver = makeResolver({
      context,
      callback,
      promise,
      resolutionMode
    })

    if (server.listening) {
      logger.debug('Server is already listening...')
      forwardRequestToNodeServer({
        server,
        event,
        context,
        resolver,
        eventSource,
        eventFns,
        logger,
        respondWithErrors
      })
    } else {
      logger.debug('Server isn\'t listening... Starting server. This is likely a cold-start. If you see this message on every request, you may be calling `awsServerlessExpress.createServer` on every call inside the handler function. If this is the case, consider moving it outside of the handler function for imrpoved performance.')
      startServer({ server })
        .on('listening', () => {
          logger.debug('Server started...')
          forwardRequestToNodeServer({
            server,
            event,
            context,
            resolver,
            eventSource,
            eventFns,
            logger,
            respondWithErrors
          })
        })
    }
  })
}

const DEFAULT_LOGGER_CONFIG = {
  level: 'warning',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
}

function configure ({
  app: configureApp,
  binaryMimeTypes: configureBinaryMimeTypes = [],
  resolutionMode: configureResolutionMode = 'CONTEXT_SUCCEED',
  eventSource: configureEventSource,
  eventFns: configureEventFns,
  respondWithErrors: configureRespondWithErrors = false,
  loggerConfig: configureLoggerConfig = {},
  logger: configureLogger = createLogger({
    ...DEFAULT_LOGGER_CONFIG,
    ...configureLoggerConfig
  }),
  createServer: configureCreateServer = ({
    app = configureApp,
    binaryMimeTypes = configureBinaryMimeTypes,
    logger = configureLogger
  } = {}) => (createServer({
    app,
    binaryMimeTypes,
    logger
  })),
  server: configureServer = configureCreateServer(),
  proxy: configureProxy = ({
    server = configureServer,
    resolutionMode = configureResolutionMode,
    event,
    context,
    callback,
    eventSource = configureEventSource,
    eventFns = configureEventFns,
    logger = configureLogger,
    respondWithErrors = configureRespondWithErrors
  } = {}) => (proxy({
    server,
    event,
    context,
    resolutionMode,
    callback,
    eventSource,
    eventFns,
    logger,
    respondWithErrors
  })),
  handler: configureHandler = (event, context, callback) => configureProxy({
    event,
    context,
    callback
  })
} = {}) {
  return {
    server: configureServer,
    createServer: configureCreateServer,
    proxy: configureProxy,
    handler: configureHandler,
    logger: configureLogger
  }
}

module.exports = {
  configure,
  getCurrentLambdaInvoke
}

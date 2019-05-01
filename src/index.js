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
'use strict'
const http = require('http')
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
  binaryMimeTypes
}) {
  const server = http.createServer(app)

  server._socketPathSuffix = getRandomString()
  server._binaryMimeTypes = binaryMimeTypes ? binaryMimeTypes.slice() : []
  server.on('error', (error) => {
    /* istanbul ignore else */
    if (error.code === 'EADDRINUSE') {
      console.warn(`WARNING: Attempting to listen on socket ${getSocketPath({ socketPathSuffix: server._socketPathSuffix })}, but it is already in use. This is likely as a result of a previous invocation error or timeout. Check the logs for the invocation(s) immediately prior to this for root cause, and consider increasing the timeout and/or cpu/memory allocation if this is purely as a result of a timeout. aws-serverless-express will restart the Node.js server listening on a new port and continue with this request.`)
      server._socketPathSuffix = getRandomString()
      return server.close(() => startServer({ server }))
    } else {
      console.log('ERROR: aws-serverless-express server error')
      console.error(error)
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
  eventFns = getEventFnsBasedOnEventSource({ eventSource })
}) {
  setCurrentLambdaInvoke({ event, context })
  return {
    server,
    promise: new Promise((resolve, reject) => {
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
        forwardRequestToNodeServer({
          server,
          event,
          context,
          resolver,
          eventSource,
          eventFns
        })
      } else {
        startServer({ server })
          .on('listening', () => forwardRequestToNodeServer({
            server,
            event,
            context,
            resolver,
            eventSource,
            eventFns
          }))
      }
    })
  }
}

function configure ({
  app: configureApp,
  binaryMimeTypes: configureBinaryMimeTypes = [],
  resolutionMode: configureResolutionMode = 'CONTEXT_SUCCEED',
  eventSource: configureEventSource,
  eventFns: configureEventFns,
  createServer: configureCreateServer = ({
    app = configureApp,
    binaryMimeTypes = configureBinaryMimeTypes
  } = {}) => (createServer({
    app,
    binaryMimeTypes
  })),
  server: configureServer = configureCreateServer(),
  proxy: configureProxy = ({
    server = configureServer,
    resolutionMode = configureResolutionMode,
    event,
    context,
    callback,
    eventSource = configureEventSource,
    eventFns = configureEventFns
  } = {}) => (proxy({
    server,
    event,
    context,
    resolutionMode,
    callback,
    eventSource,
    eventFns
  })),
  handler: configureHhandler = (event, context, callback) => configureProxy({
    event,
    context,
    callback
  })
} = {}) {
  return {
    server: configureServer,
    createServer: configureCreateServer,
    proxy: configureProxy,
    handler: configureHhandler
  }
}

module.exports = {
  configure,
  getCurrentLambdaInvoke
}

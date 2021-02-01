// ATTRIBUTION: https://github.com/dougmoscrop/serverless-http
const express = require('./express')
const koa = require('./koa')
const hapi = require('./hapi')

function getFramework ({ app, log }) {
  if (typeof app.callback === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:KOA')
    return koa
  }

  if (typeof app.handle === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:EXPRESS')
    return express
  }

  // Framework: ??
  if (typeof app.handler === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:APP_HANDLER_FUNCTION')
    return {
      sendRequest: ({ request, response }) => {
        app.handler(request, response)
      }
    }
  }

  // Framework: ??
  if (typeof app._onRequest === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:APP_ON_REQUEST_FUNCTION')
    return {
      sendRequest: ({ request, response }) => {
        app._onRequest(request, response)
      }
    }
  }

  if (typeof app === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:HAPI')
    return hapi
  }

  if (app.router && typeof app.router.route === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:APP_ROUTER_ROUTE_FUNCTION')
    return {
      sendRequest: ({ request, response }) => {
        const { url, method, headers, body } = request
        app.router.route({ url, method, headers, body }, response)
      }
    }
  }

  if (app._core && typeof app._core._dispatch === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:APP_CORE_DISPATCH_FUNCTION')
    return {
      sendRequest: ({ request, response }) => {
        return app._core._dispatch({
          app
        })(request, response)
      }
    }
  }

  if (typeof app.main === 'function') {
    log.debug('SERVERLESS_EXPRESS:GET_FRAMEWORK:APP_MAIN_FUNCTION')
    return {
      sendRequest: ({ request, response }) => {
        return app.main(request, response)
      }
    }
  }

  throw new Error('Invalid app supplied. Valid frameworks include: Express, Koa, Hapi')
}

module.exports.getFramework = getFramework

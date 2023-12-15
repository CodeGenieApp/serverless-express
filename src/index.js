const configure = require('./configure')
const { getCurrentInvoke } = require('./current-invoke')

module.exports = configure
module.exports.getCurrentInvoke = getCurrentInvoke
module.exports.configure = configure

// Legacy/deprecated:

function createServer (app, serverListenCallback, binaryMimeTypes) {
  console.warn('[DEPRECATION NOTICE] You\'re using the deprecated createServer method that will be removed in the next major version. See https://github.com/CodeGenieApp/serverless-express/blob/mainline/UPGRADE.md to upgrade.')

  if (serverListenCallback) {
    throw new Error('serverListenCallback is no longer supported.')
  }

  const configureOptions = {
    app,
    binarySettings: {
      contentTypes: binaryMimeTypes
    }
  }

  return configureOptions
}

function proxy (configureOptions, event, context, resolutionMode, callback) {
  console.warn('[DEPRECATION NOTICE] You\'re using the deprecated proxy method that will be removed in the next major version. See https://github.com/CodeGenieApp/serverless-express/blob/mainline/UPGRADE.md to upgrade.')

  const se = configure({
    ...configureOptions,
    resolutionMode
  })
  return se(event, context, callback)
}

module.exports.createServer = createServer
module.exports.proxy = proxy

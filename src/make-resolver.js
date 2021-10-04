function makeResolver ({
  context,
  callback,
  promise,
  resolutionMode
}) {
  return {
    succeed: ({ response }) => {
      if (resolutionMode === 'CONTEXT') return context.succeed(response)
      if (resolutionMode === 'CALLBACK') return callback(null, response)
      if (resolutionMode === 'PROMISE') return promise.resolve(response)
    },
    fail: ({ error }) => {
      if (resolutionMode === 'CONTEXT') return context.fail(error)
      if (resolutionMode === 'CALLBACK') return callback(error, null)
      if (resolutionMode === 'PROMISE') return promise.reject(error)
    }
  }
}

module.exports = makeResolver

function makeResolver ({
  promise
}) {
  return {
    succeed: ({ response }) => promise.resolve(response),
    fail: ({ error }) => promise.reject(error)
  }
}

module.exports = makeResolver

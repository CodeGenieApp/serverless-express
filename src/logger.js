const lazyPrint = (value) => {
  if (typeof value === 'function') { return value() }

  return value
}

function logger ({
  level = 'error'
} = {}) {
  return {
    error (message, ...additional) {
      if (!level.includes('debug', 'verbose', 'info', 'warn', 'error')) return
      console.error({
        message: lazyPrint(message),
        ...additional.map(lazyPrint)
      })
    },
    warn (message, ...additional) {
      if (!level.includes('debug', 'verbose', 'info', 'warn')) return
      console.warn({
        message: lazyPrint(message),
        ...additional.map(lazyPrint)
      })
    },
    info (message, additional) {
      if (!level.includes('debug', 'verbose', 'info')) return
      console.info({
        message: lazyPrint(message),
        ...additional.map(lazyPrint)
      })
    },
    verbose (message, additional) {
      if (!level.includes('debug', 'verbose')) return
      console.debug({
        message: lazyPrint(message),
        ...additional.map(lazyPrint)
      })
    },
    debug (message, additional) {
      if (level !== 'debug') return
      console.debug({
        message: lazyPrint(message),
        ...additional.map(lazyPrint)
      })
    }
  }
}

module.exports = logger

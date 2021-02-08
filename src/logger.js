function logger ({
  level = 'error'
} = {}) {
  return {
    error (message, additional) {
      if (!level.includes('debug', 'verbose', 'info', 'warn', 'error')) return
      console.error({
        message,
        ...additional
      })
    },
    warn (message, additional) {
      if (!level.includes('debug', 'verbose', 'info', 'warn')) return
      console.warn({
        message,
        ...additional
      })
    },
    info (message, additional) {
      if (!level.includes('debug', 'verbose', 'info')) return
      console.info({
        message,
        ...additional
      })
    },
    verbose (message, additional) {
      if (!level.includes('debug', 'verbose')) return
      console.debug({
        message,
        ...additional
      })
    },
    debug (message, additional) {
      if (level !== 'debug') return
      console.debug({
        message,
        ...additional
      })
    }
  }
}

module.exports = logger

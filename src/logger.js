const logger = {
  info (message, additional) {
    console.info({
      message,
      ...additional
    })
  },
  debug (message, additional) {
    console.debug({
      message,
      ...additional
    })
  },
  error (message, additional) {
    console.error({
      message,
      ...additional
    })
  }
}

module.exports = logger

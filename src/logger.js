const lazyPrint = value => {
  if (typeof value === 'function') {
    return value()
  }

  return value
}

const logLevels = {
  debug: [
    ['debug', 'debug'],
    ['verbose', 'debug'],
    ['info', 'info'],
    ['error', 'error'],
    ['warn', 'warn']
  ],
  verbose: [
    ['verbose', 'debug'],
    ['info', 'info'],
    ['error', 'error'],
    ['warn', 'warn']
  ],
  info: [
    ['info', 'info'],
    ['error', 'error'],
    ['warn', 'warn']
  ],
  warn: [
    ['warn', 'warn'],
    ['error', 'error']
  ],
  error: [['error', 'error']],
  none: []
}

const print =
  fn =>
    (message, ...additional) =>
      console[fn]({
        message: lazyPrint(message),
        ...(Array.isArray(additional) ? additional.map(lazyPrint) : [])
      })

const NO_OP = () => {}

function logger ({ level = 'error' } = {}) {
  const levels = logLevels[level]

  const logger = {
    error: NO_OP,
    debug: NO_OP,
    info: NO_OP,
    verbose: NO_OP,
    warn: NO_OP
  }

  if (!levels) return logger

  for (const [level2, consoleMethod] of levels) logger[level2] = print(consoleMethod)

  return logger
}

module.exports = logger

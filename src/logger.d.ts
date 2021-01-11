interface Logger {
  info: (message: string, additional: Object) => void
  debug: (message: string, additional: Object) => void
  error: (message: string, additional: Object) => void
}

export default Logger
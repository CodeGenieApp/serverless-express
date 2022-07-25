// ATTRIBUTION: https://github.com/dougmoscrop/serverless-http

const http = require('http')

const headerEnd = '\r\n\r\n'

const BODY = Symbol('Response body')
const HEADERS = Symbol('Response headers')

function getString (data) {
  if (Buffer.isBuffer(data)) {
    return data.toString('utf8')
  } else if (typeof data === 'string') {
    return data
  } else if (data instanceof Uint8Array) {
    return new TextDecoder().decode(data)
  } else {
    throw new Error(`response.write() of unexpected type: ${typeof data}`)
  }
}

function addData (stream, data) {
  if (Buffer.isBuffer(data) || typeof data === 'string' || data instanceof Uint8Array) {
    stream[BODY].push(Buffer.from(data))
  } else {
    throw new Error(`response.write() of unexpected type: ${typeof data}`)
  }
}

module.exports = class ServerlessResponse extends http.ServerResponse {
  static from (res) {
    const response = new ServerlessResponse(res)

    response.statusCode = res.statusCode
    response[HEADERS] = res.headers
    response[BODY] = [Buffer.from(res.body)]
    response.end()

    return response
  }

  static body (res) {
    return Buffer.concat(res[BODY])
  }

  static headers (res) {
    const headers = typeof res.getHeaders === 'function'
      ? res.getHeaders()
      : res._headers

    return Object.assign(headers, res[HEADERS])
  }

  get headers () {
    return this[HEADERS]
  }

  setHeader (key, value) {
    if (this._wroteHeader) {
      this[HEADERS][key] = value
    } else {
      super.setHeader(key, value)
    }
  }

  writeHead (statusCode, reason, obj) {
    const headers = typeof reason === 'string'
      ? obj
      : reason

    for (const name in headers) {
      this.setHeader(name, headers[name])

      if (!this._wroteHeader) {
        // we only need to initiate super.headers once
        // writeHead will add the other headers itself
        break
      }
    }

    super.writeHead(statusCode, reason, obj)
  }

  constructor ({ method }) {
    super({ method })

    this[BODY] = []
    this[HEADERS] = {}

    this.useChunkedEncodingByDefault = false
    this.chunkedEncoding = false
    this._header = ''

    this.assignSocket({
      _writableState: {},
      writable: true,
      on: Function.prototype,
      removeListener: Function.prototype,
      destroy: Function.prototype,
      cork: Function.prototype,
      uncork: Function.prototype,
      write: (data, encoding, cb) => {
        if (typeof encoding === 'function') {
          cb = encoding
          encoding = null
        }

        if (this._header === '' || this._wroteHeader) {
          addData(this, data)
        } else {
          const string = getString(data)
          const index = string.indexOf(headerEnd)

          if (index !== -1) {
            const remainder = string.slice(index + headerEnd.length)

            if (remainder) {
              addData(this, remainder)
            }

            this._wroteHeader = true
          }
        }

        if (typeof cb === 'function') {
          cb()
        }
      }
    })
  }
}

// ATTRIBUTION: https://github.com/dougmoscrop/serverless-http

const http = require('http')

const HTTPS_PORT = 443

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor ({ method, url, headers, body, remoteAddress }) {
    super({
      encrypted: true,
      readable: false,
      remoteAddress,
      address: () => ({ port: HTTPS_PORT }),
      end: Function.prototype,
      destroy: Function.prototype
    })

    // IncomingMessage has a lot of logic for when to lowercase or alias well-known header names,
    // so we delegate to that logic here
    const rawHeaders = Object.entries(headers).flat()
    this._addHeaderLines(rawHeaders, rawHeaders.length)

    Object.assign(this, {
      ip: remoteAddress,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method,
      body,
      url
    })

    this._read = () => {
      this.push(body)
      this.push(null)
    }
  }
}

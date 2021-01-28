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

    Object.assign(this, {
      ip: remoteAddress,
      complete: true,
      httpVersion: '1.1',
      httpVersionMajor: '1',
      httpVersionMinor: '1',
      method,
      headers,
      body,
      url
    })

    this._read = () => {
      this.push(body)
      this.push(null)
    }
  }
}

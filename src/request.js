// ATTRIBUTION: https://github.com/dougmoscrop/serverless-http

const http = require('http')
const { PassThrough } = require('stream')

const HTTPS_PORT = 443

module.exports = class ServerlessRequest extends http.IncomingMessage {
  constructor ({ method, url, headers, body, remoteAddress }) {
    const socket = new PassThrough()
    socket.encrypted = true
    socket.readable = true
    socket.remoteAddress = remoteAddress
    socket.address = () => ({ port: HTTPS_PORT })

    super(socket)

    // IncomingMessage has a lot of logic for when to lowercase or alias well-known header names,
    // so we delegate to that logic here
    const headerEntries = Object.entries(headers)
    const rawHeaders = new Array(headerEntries.length * 2)
    for (let i = 0; i < headerEntries.length; i++) {
      rawHeaders[i * 2] = headerEntries[i][0]
      rawHeaders[i * 2 + 1] = headerEntries[i][1]
    }
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

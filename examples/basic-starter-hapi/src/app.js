const Hapi = require('@hapi/hapi')

const server = Hapi.server({
  port: 3000,
  host: 'localhost'
})
server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return 'Hello World!'
  }
})
module.exports = server.listener._events.request

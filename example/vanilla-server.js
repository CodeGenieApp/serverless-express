const http = require('http')
const url = require('url')

const app = function(req, res) {
    const parsedUrl = url.parse(req.url, true)

    res.writeHead(200, {
        'Content-Type': 'text/plain charset=UTF-8'
    })

    switch (parsedUrl.pathname) {
        case '/users':
            return res.end('List of users')
        default:
            return res.end('No path match. Try /users')
    }
}

// http.createServer(app).listen(3000)

module.exports = app

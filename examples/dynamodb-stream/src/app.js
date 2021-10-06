const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.get('/events/history', (req, res) => {
  res.json(events)
})

router.post('/events/dynamodb', (req, res) => {
  if (req.header('host') !== 'dynamodb.amazonaws.com') {
    res.status(403).json({ message: 'Forbidden' })
    return
  }
  events.push(req.body)
  res.status(201)
})

// Ephemeral in-memory data store
const events = []

// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app

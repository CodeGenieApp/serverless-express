const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { getCurrentInvoke } = require('@vendia/serverless-express')
const app = express()
const router = express.Router()

app.set('view engine', 'pug')

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

router.get('/', (req, res) => {
  const currentInvoke = getCurrentInvoke()
  res.render('index', {
    apiUrl: currentInvoke ? `https://${currentInvoke.event.multiValueHeaders.host[0]}/${currentInvoke.event.requestContext.stage}` : 'http://localhost:3000'
  })
})

router.get('/vendia', (req, res) => {
  res.sendFile(path.join(__dirname, 'vendia-logo.png'))
})

router.get('/users', (req, res) => {
  res.json(users)
})

router.get('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  return res.json(user)
})

router.post('/users', (req, res) => {
  const user = {
    id: ++userIdCounter,
    name: req.body.name
  }
  users.push(user)
  res.status(201).json(user)
})

router.put('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  user.name = req.body.name
  res.json(user)
})

router.delete('/users/:userId', (req, res) => {
  const userIndex = getUserIndex(req.params.userId)

  if (userIndex === -1) return res.status(404).json({})

  users.splice(userIndex, 1)
  res.json(users)
})

const getUser = (userId) => users.find(u => u.id === parseInt(userId))
const getUserIndex = (userId) => users.findIndex(u => u.id === parseInt(userId))

// Ephemeral in-memory data store
const users = [{
  id: 1,
  name: 'Joe'
}, {
  id: 2,
  name: 'Jane'
}]
let userIdCounter = users.length

// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app

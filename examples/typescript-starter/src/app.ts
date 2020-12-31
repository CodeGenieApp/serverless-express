import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import path from 'path'
import { eventContext } from '../../../src/middleware'

const app = express()
const router = express.Router()

app.set('view engine', 'pug')

if (process.env.NODE_ENV === 'test') {
  // NOTE: @vendia/serverless-express uses this app for its integration tests
  // and only applies compression to the /sam endpoint during testing.
  router.use('/sam', compression())
} else {
  router.use(compression())
}

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(eventContext())

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

router.get('/', (req: any, res) => {
  res.render('index', {
    apiUrl: req.apiGateway ? `https://${req.apiGateway.event.headers.Host}/${req.apiGateway.event.requestContext.stage}` : 'http://localhost:3000',
  })
})

router.get('/sam', (_req, res) => {
  res.sendFile(`${__dirname}/sam-logo.png`)
})

router.get('/users', (_req, res) => {
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
    name: req.body.name,
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

const getUser = (userId: string) => users.find(u => u.id === parseInt(userId, 10))
const getUserIndex = (userId: string) => users.findIndex(u => u.id === parseInt(userId, 10))

// Ephemeral in-memory data store
const users = [{
  id: 1,
  name: 'Joe',
}, {
  id: 2,
  name: 'Jane',
}]
let userIdCounter = users.length

// The @vendia/serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
export default app

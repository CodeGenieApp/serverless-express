## From 3.x to 4.x

### Lambda Handler

```javascript
// 3.x
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

const binaryMimeTypes = [
  'image/*'
]
const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes)

exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }
```

```javascript
// 4.x
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

exports.handler = serverlessExpress({ app })
```

In v4.x, `binaryMimeTypes` isn't required as the `isBase64Encoded` Lambda response value is automatically determined based on the `content-encoding` and `content-type` headers returned by your application. If you need additional control over this, you can specify `binarySettings`:

```javascript
serverlessExpress({
  app,
  binarySettings: {
    isBinary: ({ headers }) => true,
    contentTypes: [],
    contentEncodings: []
  }
})
```

### Get Lambda event and context

```javascript
// 3.x
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
router.use(awsServerlessExpressMiddleware.eventContext())
router.get('/', (req, res) => {
  res.json({
    stage: req.apiGateway.event.requestContext.stage
  })
})
```

```javascript
// 4.x
const { getCurrentInvoke } = require('@vendia/serverless-express')
router.get('/', (req, res) => {
const currentInvoke = getCurrentInvoke()
  res.json({
    stage: currentInvoke.event.requestContext.stage
  })
})
```

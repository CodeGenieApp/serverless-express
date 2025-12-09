## From 4.x to 5.x

### Minimum Node.js Version

v5.x officially supports Node.js 24 and later, though it will likely work for earlier versions.

### Handler Changes

The handler no longer accepts a `callback` parameter. It must be used with async/Promise patterns only.

```javascript
// 4.x (still works but callback-based patterns no longer supported)
exports.handler = serverlessExpress({ app })

// 5.x (same, but MUST be async/Promise-based)
export default serverlessExpress({ app })
```

### Removed Options

The following configuration options have been removed:

- `resolutionMode` - Only Promise-based resolution is supported now
- `binaryMimeTypes` - Use `binarySettings` instead

```javascript
// 4.x (deprecated)
serverlessExpress({
  app,
  resolutionMode: 'CALLBACK',  // ❌ Removed
  binaryMimeTypes: ['image/*'] // ❌ Removed
})

// 5.x
serverlessExpress({
  app,
  binarySettings: {
    contentTypes: ['image/*']
  }
})
```

### Removed Methods

The following deprecated methods have been removed:

- `serverlessExpress.createServer()` - Use `serverlessExpress({ app })` instead
- `serverlessExpress.proxy()` - Use `serverlessExpress({ app })` instead
- `handler.handler()` - Use `handler()` directly
- `handler.proxy()` - Use `handler()` directly

### Proxy Path Fix

v5.x includes a fix for nested routes and custom domains. If you use API Gateway with a custom domain and base path mapping, routes should now work correctly.

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
const serverlessExpress = require('@codegenie/serverless-express')
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
const { getCurrentInvoke } = require('@codegenie/serverless-express')
router.get('/', (req, res) => {
const currentInvoke = getCurrentInvoke()
  res.json({
    stage: currentInvoke.event.requestContext.stage
  })
})
```

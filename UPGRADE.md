## From 3.x to 4.x

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

exports.handler = serverlessExpress({ app }).handler
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
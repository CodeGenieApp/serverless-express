const path = require('path')

module.exports = {
  entry: './src/lambda.js',
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'lambda.js',
    library: 'serverlessExpressEdge',
    libraryTarget: 'commonjs2'
  }
}

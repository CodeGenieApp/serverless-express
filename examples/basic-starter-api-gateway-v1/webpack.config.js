const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/lambda.js',
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    // library: 'serverlessExpressEdge',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/views', to: 'views' },
        { from: './src/vendia-logo.png' }
      ]
    })
  ]
}

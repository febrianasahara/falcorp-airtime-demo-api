const path = require('path')
const ZipPlugin = require('zip-webpack-plugin');
const webpack = require('webpack')
module.exports = {
  entry: './src/index',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts',
      '.js'
    ]
  },
  target: 'node',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, './dist')
  },
  plugins: [
    new ZipPlugin({ filename: 'index' }),
    new webpack.DefinePlugin({ "global.GENTLY": false })
  ]
}
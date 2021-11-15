const path = require('path');

module.exports = {
  // JavaScript 执行入口文件
  entry: './main',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  },
  resolve: {
    // 先尝试 ts 后缀的 TypeScript 源码文件
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      },
      {
        // 增加对scss文件的支持
        test: /\.scss$/,
        // SCSS 文件的处理顺序为先 sass-loader 再 css-loader 再 style-loader
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  // 输出 source-map 方便直接调试 ES6 源码
  devtool: 'source-map'
}
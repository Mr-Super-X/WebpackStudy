/**
 * node_modules中的包会被打包成一个chunk，
 * 使用dll技术，对某些第三方库进行单独打包
 *
 * 做法：1.创建webpack.dll.js填写dll配置
 *      2.运行命令：webpack --config webpack.dll.js生成dll文件
 *      3.配置webpack.config.js，告诉webpack哪些库不参与打包：webpack.DllReferencePlugin
 *      4.配置webpack.config.js，将打包好的dll文件自动引入到页面上：add-asset-html-webpack-plugin
 */

const webpack = require('webpack');
const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    // 需要提取的库文件
    vendor: ['jquery'],
  },
  output: {
    filename: '[name].dll.js',
    path: resolve(__dirname, 'dll'), // 将打包的动态链接库输出到dll目录中
    // 打包的库里面向外暴露的内容叫什么名字
    // 保持与 webpack.DllPlugin 插件配置中name名称一致
    library: '[name]_[hash]',
  },
  plugins: [
    // 清除之前的dll文件
    new CleanWebpackPlugin(),
    // 该插件为webpack自带插件无需单独引用
    // manifest.json 描述动态链接库包含了哪些内容
    new webpack.DllPlugin({
      name: '[name]_[hash]', // 映射库的名称，保持与output里面的library一致
      path: resolve(__dirname, 'dll/manifest.json'), // 输出文件路径
    })
  ],
  mode: 'production'
};

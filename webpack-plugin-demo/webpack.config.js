const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // JavaScript 执行入口文件
  entry: "./main.js",
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: "bundle.js",
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, "./dist"),
  },
  // Plugin 是用来扩展 Webpack 功能的，通过在构建流程里注入钩子实现，它给 Webpack 带来了很大的灵活性。

  // 要让以下代码运行起来，需要先安装新引入的插件：
  // npm i mini-css-extract-plugin -D
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 css 文件
        test: /\.css$/,
        // 转换 .css 文件需要使用的 Loader
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // 从 .js 文件中提取出来的 .css 文件的名称
      filename: `[name]_[contenthash:8].css`,
    }),
  ],
};

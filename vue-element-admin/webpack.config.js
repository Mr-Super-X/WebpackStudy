// 手写webpack打包vue-element-admin
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./src/main.js",
  mode: "production",
  resolve: {
    extensions: [".mjs", ".js", ".json", ".vue"],
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    },
  },
  module: {
    rules: [
      // 解析.vue文件
      // 需配合VueLoaderPlugin使用
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      // babel配置
      {
        test: /\m?js$/,
        loader: "babel-loader",
        exclude: /(node_modules)/,
        options: {
          presets: ["@babel/preset-env"], // 将ES6转译成ES5
        },
      },
      // 解析以下文件格式
      {
        test: /\.(png|gif|jpe?g|ttf|woff)$/,
        use: [
          {
            // 与file-loader不同的是url-loader不仅可以生成文件，
            // 还可以通过配置options，让资源大小小于某个阈值的资源内联到文件中去
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
      // 因为这个项目vue.config.js中配置了svg策略，所以在这里要单独将svg提取出来处理
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-sprite-loader",
            options: {
              symbolId: "icon-[name]", // 跟vue.config.js配置保持一致
            },
          },
        ],
      },
      // 解析sass、css、style，倒序
      {
        test: /\.s[ac]ss|css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              // 官方推荐的包，不依赖二进制的东西，可以大大提高编译速度
              implementation: require("dart-sass"),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // webpack内置的打包进度插件
    new webpack.ProgressPlugin(),
    // 必要：配合vue-loader使用才能正确工作
    new VueLoaderPlugin(),
    // 将打包后的文件自动插入到页面上
    new HtmlWebpackPlugin({
      path: __dirname + "/dist",
      filename: "index.html",
      template: "public/index.html",
      templateParameters: {
        BASE_URL: "/",
        webpackConfig: {
          name: "Webpack Demo",
        },
      },
    }),
    // 因为每次打包出来的文件hash值都不同，会导致dist目录越来越大
    // 因此需要每次打包时都自动清除之前的文件
    new CleanWebpackPlugin({
      verbose: true, // 查看清除了什么内容
    }),
  ],
  output: {
    // 输出的位置
    path: path.resolve(__dirname, "dist"),
    // 输出的文件名
    filename: "app.bundle.js",
  },
};

module.exports = config;

// 至此一个vue-element-admin的手写webpack打包配置就写完了
// 接下来是配置打包优化

// 优化webpack打包策略
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
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
          // 将css提取出来单独进行缓存
          // 需配合MiniCssExtractPlugin使用
          /* {
            loader: MiniCssExtractPlugin.loader,
          }, */
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
    // 我们想分的chunk和最终生成的chunk文件之间的关系可以在生成的文件中查看
    // 编写ssr程序非常重要，因为每次打包后的文件名都不同，因此我们需要一个映射关系
    new WebpackManifestPlugin({
      filename: "meta/manifest.json",
    }),
    // 必要：配合vue-loader使用才能正确工作
    new VueLoaderPlugin(),
    // 必要：配合MiniCssExtractPlugin.loader使用才能正确工作
    new MiniCssExtractPlugin({
      // webpack中有三种hash：contenthash、chunkhash、hash
      // hash：跟打包构建相关，即使什么都没改，打包多次的hash也是不同的，会导致全量更新，因为每次打包
      //       结果都是不一样的，用户下一次访问这个网站时由于hash变了，所有的资源都需要重新下载，会变得很慢
      //       之所以用hash我们期待的效果是让用户浏览器只更新发生变化的逻辑，对于没有发生变化的，就从
      //       浏览器的缓存中提取，这样会让页面速度变快。
      // 对于文件hash，chunkhash和contenthash都有，但是它们有一些区别：
      // chunkhash：以MiniCssExtractPlugin为例，它会把分出来的包比如chunk1、chunk2、chunk3里面所引入的css
      //       分别也分成chunk1.css、chunk2.css、chunk3.css，js同理。这时候chunk1.css和chunk1.js它俩用的
      //       是同一个hash。这就会导致一个问题，如果要修改js内容的话整个chunk都发生了变化，这时候chunkhash
      //       就会发生改变，导致css的文件名和js的文件名都会发生变化，js文件名发生变化是正常的，因为我们希望
      //       用户重新下载这个js，但是css的文件名我们不希望它发生变化，因为修改的内容只在js里，所以为了解决
      //       这个问题，webpack就引入了contenthash。
      // contenthash：只针对文件，一般用于提取css这个场景，也就是说如果分出的chunk1里有一个chunk1.css、chunk1.js
      //       如果你只改了js并且你的文件名用了contenthash，css文件名不会发生变化，它的缓存依然是有效的。
      filename: "[name].[contenthash:8].css", // 所以我们这里使用contenthash
      chunkFilename: "chunk.[id].[contenthash:8].css",
    }),
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
    // 优化favicon.ico没有被打包进dist问题
    new CopyPlugin({
      // 官方文档已过时，请参考以下配置
      patterns: [
        {
          from: "public/favicon.ico", // 从public目录将favicon.ico拷贝到dist目录，不指定to默认情况下使用output配置的path
          context: process.cwd(), // 指定从哪个根目录开始找路径
        },
      ],
    }),
    // 利用BundleAnalyzerPlugin分析每个Bundle是什么情况，如果有明显比较大的包再通过externals分出去
    new BundleAnalyzerPlugin(),
  ],
  // 使用externals减小bundle打包体积
  // 需要通过引入CDN将这些变量注入进来
  // 可以一条一条添加并运行打包来对比bundle的大小（BundleAnalyzerPlugin会启动一个分析页面）
  externals: {
    vue: "Vue", // 项目里所有引用vue的逻辑，用全局变量Vue代替(这一步是去除打包vue.runtime.esm.js)
    echarts: "echarts", // 将echarts使用echarts全局变量来代替
    xlsx: "XLSX", // 将xlsx使用XLSX全局变量来代替
    jquery: "jQuery", // 将jquery使用jQuery全局变量来代替(package.json中没有该依赖，应该在第三方插件的依赖中)

    // 这个库有问题，这样配置可以从bundle中去除mockjs，本项目中通过const Mock = require('mockjs')引入，
    // 使用cdn引入后打包成功，页面会报错Cannot read properties of undefined (reading 'mock')
    // 估计和mockjs的导出方式有关，导致bundle分包时没有拿到mock属性
    // mockjs: {
    //   // 需要按这种方式配置才能生效
    //   commonjs: "Mock", // 如果我们的库运行在Node.js环境中，import Mock from 'mockjs'等价于const Mock = require('mockjs')
    //   commonjs2: "Mock", // 同上
    //   amd: "Mock", // 如果我们的库使用require.js等加载,等价于 define(["Mock"], factory);
    //   root: "Mock", // 如果我们的库在浏览器中使用，需要提供一个全局的变量‘Mock’，等价于 var Mock = (window.Mock) or (Mock);
    // },
    "js-cookie": "Cookies", // 将js-cookie使用Cookies全局变量来代替
    "tui-editor": "Editor", // 将tui-editor使用Editor全局变量来代替
  },
  // 优化策略配置
  optimization: {
    splitChunks: {
      // 默认情况下webpack使用async，只对动态import进行分包
      // initial：在async的基础上，还支持一些同步模块分包，但是同步模块分包和异步模块分包是两个分包。
      //          例如在同步模块中依赖了a，异步模块中也依赖了a，它没有办法把这两个抽成同一个chunk，
      //          而是抽成两个chunk。
      // all：无论是同步还是异步，只要webpack发现某一块代码是可以复用的，就会把这块可以复用的代码抽成
      //      一个chunk，这个chunk既会被异步模块依赖，也会被同步模块依赖。
      chunks: "all", // async initial all
      // 分包策略：
      // 该配置分成了三个缓存组
      cacheGroups: {
        // libs就是node_modules里的这些东西
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial", // only package third parties that are initially dependent
        },
        // 对node_modules里的element-ui单独做了一个缓存组，因为element-ui一般不会发生变化，但是node_modules有时候
        // 会发生一些变化，例如需要npm install引入lodash等工具时，node_modules会发生一些变化，所以对element-ui做了特殊的抽取。
        // 可以注意到这里的priority高于上面的chunk-libs，原因是它们的优化范围是重合的，都在node_modules下，在重合的基础上
        // 如果不把element-ui的priority设高一点，这个chunk根本就不会被打包出来。
        elementUI: {
          name: "chunk-elementUI", // split elementUI into a single package
          priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
          test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
        },
        // 对当前工程下的components进行分组
        commons: {
          name: "chunk-commons",
          test: path.resolve("src/components"), // can customize your rules
          minChunks: 3, //  minimum common number
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // runtime维护了一个模块之间的映射关系，这个映射关系可能每次打包都会变化
    // 我们希望这个runtime可以单独抽离出来，这样不会导致其它的chunk每次构建都发生变化
    runtimeChunk: "single", // 把webpack的运行环境单独打成一个chunk
  },
  output: {
    // 输出的位置
    path: path.resolve(__dirname, "dist"),
    // 输出的文件名
    filename: "[name].[contenthash:8].bundle.js",
    chunkFilename: "chunk.[id].[contenthash:8].js",
  },
};

module.exports = config;

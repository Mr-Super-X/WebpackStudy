/*
 * @Description:
 * @Tips: 亲，记得补全功能描述哦~  (ღ˘⌣˘ღ)
 * @Author: Mr.Mikey
 * @Contact: 1303232158@qq.com
 * @Date: 2022-04-20 19:07:23
 * @LastEditors: Mr.Mikey
 * @LastEditTime: 2022-04-22 14:06:45
 * @FilePath: \webpack5-study\webpack-dll\webpack.config.js
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
// const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const webpack = require('webpack');
const glob = require('glob');
const { resolve, join } = require('path'); 

/**
 * HRM：hot module replacement 模块热更新
 * 作用：一个模块发生改变，只会重新打包这一个模块而不是所有模块，
 *      极大提升构建速度。
 *
 * css文件：可以使用HRM功能，因为style-loader、MiniCssExtractPlugin.loader内部实现了
 * js文件：默认不使用HRM功能，需要添加支持HRM功能的代码（在入口文件main.js中）
 *    注意：js模块热替换功能针对非入口文件的其他模块来做，因为入口文件会引入其他模块，入口文件
 *         变化其他所有模块都会跟着编译，因此不对入口文件做HRM。
 *        if (import.meta.webpackHot) {
 *          import.meta.webpackHot.accept('./print.js', () => {
 *            // 更新逻辑
 *             print(3, 4);
 *          });
 *        }
 * html文件：默认不使用HMR功能，devServer.hot设置为true后还会导致修改html内容不再刷新浏览器。
 *     解决：修改entry，将html文件引入
 *           entry: ['./src/main.js', './src/index.html']
 *     思考：单页应用只有一个html文件，修改后刷新和热更有区别吗？那么热更优化还有需要做吗？
 */

/**
 * 缓存
 *
 * 1.babel缓存
 *    cacheDirectory: true
 * 2.文件资源缓存
 *    hash：每次webpack构建时会生成一个唯一的hash值
 *          问题：js和css同时使用一个hash值，只改动一个文件重新打包会导致所有缓存失效
 *    chunkhash：根据chunk生成的hash值，如果打包来源一个chunk，hash值就一样
 *          问题：js和css的hash值还是一样，因为css是在js中引入的，所以属于一个chunk
 *    contenthash：根据文件内容生成hash值，不同文件hash值一定不一样，只要文件内容没变，
 *          不管构建多少次hash值都不会变
 */

/**
 * tree shaking
 *
 * 使用条件：
 *    1. 使用esmodule
 *    2. mode设置为production
 *
 * 在package.json中配置 "sideEffects": false
 * 表示所有代码都没有副作用，都可以被tree shaking
 * 问题：可能会把在js中import的css也删除
 * 解决：配置sideEffects，将不要tree shaking的资源进行标记
 *    "sideEffects": ["*.css", "*.less", ...]
 */

/**
 * 懒加载和预加载
 *
 * 懒加载：当文件需要使用时才加载
 * 预加载：会在使用之前提前加载（兼容性不好，慎用）
 *   注意：正常加载可以认为是并行加载（同一时间加载多个文件），预加载是等其他资源加载完毕，浏览器空闲了
 *        才偷偷加载，这样可以一定程度上提升体验，比如点击加载一个过大资源会导致延迟很久，开启预加载后
 *        就可以解决点击延迟的问题
 *
 * 使用方式：动态import开启懒加载，魔法注释webpackPrefetch: true开启预加载
 */
// import(/* webpackChunkName: 't', webpackPrefetch: true */ './t').then((res) => {
//   console.log(res);
// });

/**
 * PWA：渐进式网络开发应用程序（离线可访问技术）
 *
 * workbox --> workbox-webpack-plugin
 */

// 获取匹配文件
const purgeFiles = glob.sync(`${join(__dirname, 'src')}/**/*`, { nodir: true });
purgeFiles.push(resolve(__dirname, 'src/index.html'));

// 定义公共的css-loader
const commonCssLoader = [
  // 'style-loader', // 创建style标签，将css资源插入到style中执行
  MiniCssExtractPlugin.loader, // 将css资源从js中提取出来做成单独的css文件并创建link标签引入到页面
  'css-loader', // 将css资源处理成模块嵌入到打包的js文件中
  /**
   * css兼容性处理：postcss --> postcss-loader postcss-preset-env
   *
   * postcss-preset-env：帮助postcss找到package.json中的browserslist配置，
   * 通过配置加载指定的兼容性样式。配置内容可在github上搜索browserslist关键字
   */
  {
    loader: 'postcss-loader',
    ident: 'postcss',
    options: {
      postcssOptions: {
        // 或者将插件引入写在单独的配置js中
        // config: './config/postcss.config.js',
        plugins: ['postcss-preset-env'],
      },
    },
  },
];

// 设置node环境变量（测试postcss时使用）
// process.env.NODE_ENV = 'production';

module.exports = {
  // 单入口（适合单页应用）
  // entry: './src/main.js',
  entry: ['./src/main.js', './src/index.html'],

  // 多入口（适合多页应用）
  // 打包后会生成入口数量个js（bundle）文件，并自动引入到html中
  // entry: {
  //   main: './src/main.js',
  //   test: './src/t.js'
  // },
  output: {
    filename: '[name].[contenthash:10].bundle.js',
    path: resolve(__dirname, 'build'),
    clean: true, // 每次构建清除前一次构建的内容
  },
  module: {
    rules: [
      {
        // 假如我设置了七八个loader处理相应的文件，虽然test正则校验文件名称后缀不通过，
        // 但是每个文件还是都要经过一下这七八个loader，设置oneOf就是处理这个，
        // 如果找到了某一个文件的处理loader，就直接用，不用再过后面的loader了，提高构建速度。
        // 注意：不能有多个配置处理同一类型的文件
        oneOf: [
          /**
           * css资源处理
           */
          {
            test: /\.css$/,
            use: [...commonCssLoader],
          },
          /**
           * less资源处理
           */
          {
            test: /\.less$/,
            use: [...commonCssLoader, 'less-loader'],
          },
          /**
           * 图片资源处理
           * 问题：处理不了img标签中src引入的图片
           */
          {
            test: /\.(png|jpg|gif)$/,
            loader: 'url-loader',
            options: {
              limit: 60 * 1024, // 小于60kb的图片处理成base64减少http请求（减轻服务器压力）
              // 因为url-loader使用es module，而html-loader使用commonjs，
              // 解析时会出问题：[object Module]
              // 解决：关闭url-loader的es module，使用commonjs解析
              esModule: false,
            },
            // 在webpack5中url-loader、file-loader已经弃用，如果想要继续使用则需要
            // 添加type: 'javascript/auto'
            type: 'javascript/auto',
          },
          /**
           * 处理img标签src引入的图片
           * 不推荐使用html-loader，会导致热更新时img加载失败
           */
          {
            test: /\.html$/,
            // 负责引入img，从而能被url-loader处理
            loader: 'html-withimg-loader',
            options: {
              esModule: false,
            },
          },
          /**
           * 处理其他资源（如字体文件等）
           */
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            loader: 'file-loader',
            options: {
              name: '[hash:10].[ext]',
              esModule: false,
            },
          },
          /**
           * js兼容性处理：babel-loader @babel/core
           * 
           *   1.基本js兼容处理 --> @babel/preset-env
           *     问题：只能转换基本语法，promise等高级语法不能转换
           *   2.全部js兼容处理 --> @babel/polyfill（在入口文件中import即可）
           *     问题：只需要解决部分兼容问题，但是将所有兼容代码都引入了，体积太大
           *   3.按需兼容处理： --> core-js
           */
          {
            test: /\.js$/, // 只对js文件做处理
            exclude: /node_modules/, // 排除node_modules
            use: [
              /**
               * 开启多进程构建
               * 
               * 进程启动时间约为600ms，进程通信也有开销，只有打包耗时很久才需要开启多进程构建，
               * 否则还会拖慢构建速度。
               */
              {
                loader: 'thread-loader',
                options: {
                  // workers: '', // 开启的进程数量，默认是CPU核心数 - 1
                }
              },
              {
                loader: 'babel-loader',
                options: {
                  // 预设：指示babel做什么样的兼容处理
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        // 按需加载
                        useBuiltIns: 'usage',
                        // 指定core-js版本
                        corejs: {
                          version: 3,
                        },
                        // 指定兼容性做到哪个版本浏览器
                        targets: {
                          chrome: 60,
                          firefox: 60,
                          ie: 9,
                          safari: 10,
                          edge: 17,
                        },
                      },
                    ],
                  ],
                  // 开启babel编译缓存
                  // 第二次构建时会读取缓存，从而提升构建速度
                  cacheDirectory: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    // 创建html模板
    new HtmlWebpackPlugin({
      filename: 'index.html', // 打包后的模板名称
      template: './src/index.html', // 拷贝哪个文件
      /**
       * html压缩，只需要开启minify选项即可
       */
      minify: {
        collapseWhitespace: true, // 移除空格
        removeComments: true, // 移除注释
      },
    }),
    // 提取css文件，配合loader使用
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:10].css', // 提取后的文件名
    }),
    // 删除没有用到的css（需要安装glob包）
    new PurgeCSSPlugin({
      paths: purgeFiles,
    }),
    /**
     * 语法检查：eslint-webpack-plugin
     * 设置检查规则：
     *    在package.json中eslintConfig中设置
     *    "eslintConfig": {
     *      "extends": "airbnb-base"
     *    }
     *    推荐airbnb --> eslint-config-airbnb-base eslint eslint-plugin-import
     *    eslint-config-airbnb-base：只检查es6+代码，也可选airbnb其他规则
     *    可在github搜索关键词airbnb/javascript查看详情
     */
    new ESLintPlugin({
      fix: true, // 自动修复eslint
      quiet: true, // 设置为 true 后，仅处理和报告错误，忽略警告（开发模式调试用）
    }),
    /**
     * 生成一个serviceWorker配置文件
     *
     * 需要在入口文件中注册serviceWorker
     *
     * // sw代码必须运行在服务器上，因此通过npm i serve -g来测试
     * // 安装后使用serve -s build命令来启动，build指的是代码目录
     * // 注册serviceWorker
     *   if ('serviceWorker' in navigator) {
     *     window.addEventListener('load', () => {
     *       // service-worker.js由WorkboxWebpackPlugin自动生成
     *       navigator.serviceWorker
     *         .register('./service-worker.js')
     *         .then(() => {
     *           console.log('serviceWorker注册成功');
     *         })
     *         .catch(() => {
     *           console.log('serviceWorker注册失败');
     *         });
     *     });
     *   }
     */
    /* new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true, // 帮助serviceWorker快速启动
      skipWaiting: true, // 删除旧的serviceWorker
    }), */
    /**
     * 告诉webpack哪些库不参与打包
     */
    new webpack.DllReferencePlugin({
      manifest: resolve(__dirname, 'dll/manifest.json')
    }),
    /**
     * 将打包出去的dll动态链接库自动引入到页面上
     */
    new AddAssetHtmlWebpackPlugin({
      filepath: resolve(__dirname, 'dll/vendor.dll.js')
    })
  ],
  // 生产环境会自动压缩js代码，只需要将mode设置为production即可开启压缩
  mode: 'production', // 可通过npm script设置
  // 生产环境需要考虑是否开启，开发环境推荐使用source-map或者eval-cheap-module-source-map
  // 参考：https://zhuanlan.zhihu.com/p/374101233
  devtool: 'cheap-module-source-map',
  /**
   * webpack配置优化选项
   */
  optimization: {
    /**
     * 压缩css（可以用其他的plugin，这个最好用，只是不在plugins选项中使用）
     *
     */
    minimizer: [new CssMinimizerPlugin()],
    /**
     * 1.可以将node_modules中的代码单独打包成一个chunk
     * 2.自动分析多入口chunk中有没有公共的文件依赖，如果有会将公共依赖打包成单独的chunk
     * 3.通过js代码，让某个文件被单独打包成一个chunk
     *    import动态导入语法：能将某个文件单独打包
     *    可通过魔法注释来给打包的文件命名
     */
    //  import(/*webpackChunkName: 't'*/ './t')
    //  .then((res) => {
    //    console.log(res);
    //  })
    //  .catch((e) => console.log(e));
    splitChunks: {
      chunks: 'all',
    },
  },

  /**
   * 防止将某些import的包打包到最终的bundle中，例如jquery
   * 
   * 做法：1.在webpack配置中设置externals，配置规则为【忽略的库名: npm项目包名】
   *      2.将如jquery之类的包放在cdn，在index.html中通过script引入
   * 
   * 这样在代码中import $ from 'jquery'时就不会再打包jquery，
   * 并且能够正常使用jquery
   */
  externals: {
    jquery: 'jQuery', // 拒绝jQuery被打包
  },

  /**
   * 开发服务器devServer：用来自动化编译、自动刷新、自动打开浏览器等
   * 启动命令：webpack serve （webpack-cli推荐）
   * 特点：没有输出，只会在内存中编译
   */
  devServer: {
    // 代理url 请求/api时代理到http://localhost:3000
    proxy: {
      '/api': 'http://localhost:3000',
    },
    compress: true, // 启动gzip压缩
    open: true, // 自动使用默认浏览器打开
    port: 3000, // 端口号
    hot: true, // 热更新
  },
};

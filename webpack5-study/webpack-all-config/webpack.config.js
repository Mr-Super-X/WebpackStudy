/*
 * @Description:
 * @Tips: 亲，记得补全功能描述哦~  (ღ˘⌣˘ღ)
 * @Author: Mr.Mikey
 * @Contact: 1303232158@qq.com
 * @Date: 2022-04-20 19:07:23
 * @LastEditors: Mr.Mikey
 * @LastEditTime: 2022-04-22 12:53:20
 * @FilePath: \webpack-study\06.webpack-PWA\webpack.config.js
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
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

// 因为css和less等都要用这几个loader，在这里定义公共的css-loader进行复用
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
  // entry: './src/main.js', // 表明入口是main.js
  entry: ['./src/main.js', './src/index.html'], // 添加index.html是为了解决开发环境开启HRM后修改html内容不刷新

  // 多入口（适合多页应用）
  // 打包后会生成入口数量个js（bundle）文件，并自动引入到html中
  // entry: {
  //   main: './src/main.js',
  //   test: './src/t.js'
  // },
  output: {
    filename: '[name].[contenthash:10].bundle.js', // 对打包后的bundle进行命名，[name]会取entry中的文件名
    path: resolve(__dirname, 'build'), // 输出文件到根目录下的build目录中
    clean: true, // 每次构建清除前一次构建的内容
    chunkFilename: '[name]_chunk.[contenthash:10].js', // 对打包后的chunk进行命名，[name]会取webpackChunkName
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
                },
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
     *
     * 注意：推荐交给prettier来做代码格式修复，eslint也可以在CI/CD流程中配置，
     * 尽量使webpack的职责单一，只做打包这件事情。
     */
    new ESLintPlugin({
      fix: true, // 自动修复eslint（会修改源代码格式，慎用）
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
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true, // 帮助serviceWorker快速启动
      skipWaiting: true, // 删除旧的serviceWorker
    }),
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
     * 允许你通过提供一个或多个定制过的 TerserPlugin 实例，覆盖默认压缩工具(minimizer)。
     *
     * 配置生产环境的压缩方案：js、css
     */
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css
    ],
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

    /**
     * webpack 将根据以下条件自动拆分 chunks：
     *
     * 1.新的 chunk 可以被共享，或者模块来自于 node_modules 文件夹
     * 2.新的 chunk 体积大于 20kb（在进行 min+gz 之前的体积）
     * 3.当按需加载 chunks 时，并行请求的最大数量小于或等于 30
     * 4.当加载初始化页面时，并发请求的最大数量小于或等于 30
     *
     * 下面这个配置对象代表 SplitChunksPlugin 的默认行为
     *
     * splitChunks: {
     *   chunks: 'async', // 只对异步模块进行分割
     *   minSize: 20000, // 生成chunk的最小体积，表示大于20kb才分割chunk
     *   minRemainingSize: 0, // 通过确保拆分后剩余的最小 chunk 体积超过限制来避免大小为零的模块
     *   minChunks: 1, // 要提取的chunk最少被引用1次
     *   maxAsyncRequests: 30, // 按需加载时的最大并行请求数
     *   maxInitialRequests: 30, // 入口点的最大并行请求数。
     *   enforceSizeThreshold: 50000, // 强制执行拆分的体积阈值和其他限制（minRemainingSize，maxAsyncRequests，maxInitialRequests）将被忽略。
     *   automaticNameDelimiter: '~', // 分割chunk的名称连接符
     *   cacheGroups: {
     *     // 分割chunk的组，每一组都是一种分割规则
     *     defaultVendors: {
     *       // 这一组的意思是node_modules里的文件会被打包到defaultVendors这个chunk中
     *       // 输出的文件名格式为：defaultVendors~xxx.js（xxx表示模块名称）
     *       // 上面配置的规则对组的配置都生效，如大小超过20kb、至少被引用1次等等
     *       test: /[\\/]node_modules[\\/]/,
     *       priority: -10, // 打包的优先级
     *       reuseExistingChunk: true, // 如果当前要打包的模块和之前已经被提取的模块是同一个，就会复用，而不是重新打包
     *     },
     *     default: {
     *       minChunks: 2, // 最少引用2次
     *       priority: -20, // 打包的优先级
     *       reuseExistingChunk: true, // 如果当前要打包的模块和之前已经被提取的模块是同一个，就会复用，而不是重新打包
     *     },
     *   },
     * },
     */
    splitChunks: {
      chunks: 'all', // all表示同步模块和异步模块都可以进行分割
    },
    /**
     * 场景：当我们为output.chunkFilename设置包含contenthash的名称时，假设A模块引用了B模块，此时A模块记录了B模块名称的
     * hash值，当修改B模块的内容重新打包后B模块的hash值变了，虽然A模块的内容没有修改，但是由于A模块引用了B模块，此时
     * A模块也会被重新打包生成，这显然是不可取的，因此需要解决，而解决方案就是runtimeChunk配置，runtimeChunk的作用就是
     * 通过将当前模块记录其它模块的hash单独打包成一个runtimeChunk文件，这个文件就会记录好之前在A模块中记录的B模块
     * 的hash值，再次修改B模块的内容时只会重新生成B模块和runtimeChunk文件，这样就能保障其他模块的缓存持久化不出问题。
     *
     * 通过将 optimization.runtimeChunk 设置为 object，对象中可以设置只有 name 属性，
     * 其中属性值可以是名称或者返回名称的函数，用于为 runtime chunks 命名。
     */
    runtimeChunk: {
      name: (entrypoint) => `runtimechunk~${entrypoint.name}`,
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
   * 解析模块的规则
   */
  resolve: {
    /**
     * 配置解析模块路径别名
     *
     * 优点：简写路径、减少递归解析
     * 缺点：没有代码提示（配合vscode插件+设置可以解决）、可能会导致tree-shaking失效
     *
     * 全面解释：http://webpack.wuhaolin.cn/4%E4%BC%98%E5%8C%96/4-1%E7%BC%A9%E5%B0%8F%E6%96%87%E4%BB%B6%E6%90%9C%E7%B4%A2%E8%8C%83%E5%9B%B4.html
     */
    alias: {
      '@css': resolve(__dirname, 'src/css'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      /**
       * 当import react from 'react'时：
       * 默认情况下 Webpack 会从入口文件 ./node_modules/react/react.js 开始递归的解析和处理依赖的几十个文件，
       * 这会时一个耗时的操作。 通过配置 resolve.alias 可以让 Webpack 在处理 React 库时，
       * 直接使用单独完整的 react.min.js 文件，从而跳过耗时的递归解析操作。
       *
       * 一般对整体性比较强的库采用本方法优化，因为完整文件中的代码是一个整体，每一行都是不可或缺的。
       * 但是对于一些工具类的库，例如 lodash，你的项目可能只用到了其中几个工具函数，你就不能使用本方法去优化，
       * 因为这会导致你的输出代码中包含很多永远不会执行的代码。
       */
      react: path.resolve(__dirname, './node_modules/react/dist/react.min.js'),
    },
    /**
     * 配置省略文件名的后缀规则
     *
     * 在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试询问文件是否存在，
     * 默认是extensions: ['.js', '.json']
     * 也就是说当遇到 require('./data') 这样的导入语句时，Webpack 会先去寻找 ./data.js 文件，
     * 如果该文件不存在就去寻找 ./data.json 文件，如果还是找不到就报错。
     *
     * 如果这个列表越长，或者正确的后缀在越后面，就会造成尝试的次数越多，所以 resolve.extensions 的配置也会影响到构建的性能。
     * 在配置 resolve.extensions 时你需要遵守以下几点，以做到尽可能的优化构建性能：
     *
     * 1.后缀尝试列表要尽可能的小，不要把项目中不可能存在的情况写到后缀尝试列表中。
     * 2.频率出现最高的文件后缀要优先放在最前面，以做到尽快的退出寻找过程。
     * 3.在源码中写导入语句时，要尽可能的带上后缀，从而可以避免寻找过程。例如在你确定的情况下把
     *   require('./data') 写成 require('./data.json')
     */
    extensions: ['.js', '.vue', '.json'],
    /**
     * 告诉webpack去哪些目录下寻找第三方模块，默认值是['node_modules']
     * 含义是先去当前目录下的 ./node_modules 目录下去找想找的模块，如果没找到就去上一级目录 ../node_modules 中找，
     * 再没有就去 ../../node_modules 中找，以此类推，这和 Node.js 的模块寻找机制很相似。
     *
     * 当安装的第三方模块都放在项目根目录下的 ./node_modules 目录下时，没有必要按照默认的方式去一层层的寻找，
     * 可以指明存放第三方模块的绝对路径，以减少寻找，可提升解析速度。
     */
    modules: [path.resolve(__dirname, 'node_modules')], // 指明第三方模块都放在根目录下的node_modules中
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

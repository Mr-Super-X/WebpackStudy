const path = require("path");

module.exports = {
  // JavaScript 执行入口文件
  entry: "./main.js",
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: "bundle.js",
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, "./dist"),
  },
  // Loader 可以看作具有文件转换功能的翻译员，配置里的 module.rules 数组配置了一组规则，告诉 Webpack 在遇到哪些文件时使用哪些 Loader 去加载和转换。 
  // 如下配置告诉 Webpack 在遇到以 .css 结尾的文件时先使用 css-loader 读取 CSS 文件，再交给 style-loader 把 CSS 内容注入到 JavaScript 里。 
  // 在配置 Loader 时需要注意的是：

  // use 属性的值需要是一个由 Loader 名称组成的数组，Loader 的执行顺序是由后到前的；
  // 每一个 Loader 都可以通过 URL querystring 的方式传入参数，例如 css-loader?minimize 中的 minimize 告诉 css-loader 要开启 CSS 压缩。
  // 想知道 Loader 具体支持哪些属性，则需要我们查阅文档，例如 css-loader 还有很多用法，我们可以在 css-loader 主页 上查到。
  // https://github.com/webpack-contrib/css-loader

  // 在重新执行 Webpack 构建前要先安装新引入的 Loader：
  // npm i -D style-loader css-loader
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 css 文件
        test: /\.css$/,
        // use的两种写法：
        // use: ['style-loader', 'css-loader?minimize'],
        use: ["style-loader", {
          loader: "css-loader",
          options: {
            // css-loader 1.0 以上已经将 minimize 这个属性去掉了。
            // 参考链接：https://www.cnblogs.com/isXianYue/p/14315803.html
            // minimize: true,
          }
        }],
      },
    ],
  },
};

// 除了在 webpack.config.js 配置文件中配置 Loader 外，还可以在源码中指定用什么 Loader 去处理文件。 
// 以加载 CSS 文件为例，修改上面例子中的 main.js 如下：
// require('style-loader!css-loader!./main.css');

// 这样就能指定对 ./main.css 这个文件先采用 css-loader 再采用 style-loader 转换。


说明：所有的配置可在webpack-all-config中查看，dll相关的配置在webpack-dll中查看。

# webpack性能优化

* 开发环境性能优化
* 生产环境性能优化


### 开发环境性能优化

##### 优化打包构建速度

* **HRM**：css（style-loader）、js（人为注入代码）、html（不用做，reload需要将html文件加入entry）

##### 优化代码调试

* **source-map**：生产环境需要考虑是否开启，开发环境推荐使用source-map或者cheap-module-source-map


### 生产环境性能优化

##### 优化打包构建速度

* **oneOf**：精准运行loader
* **babel缓存**：babel-loader中开启cacheDirectory
* **多进程打包**：早期happypack，现在thread-loader
* **externals**：配置不打包的库，将库放在CDN，在html中引入后在代码中使用import导入也能用（不打包某些资源，比较彻底，如果公司有部署cdn服务，使用它最好）
* **dll**：单独将第三方库打包成动态链接库，之后webpack将不再打包动态链接库中的资源（第一次将某些资源打包，之后就不再打包这些资源，如果公司没有部署cdn服务，使用它最好）

##### 优化代码运行性能

* **缓存**：hash、chunkhash、contenthash
* **tree shaking**：遵循esModule，mode设置为production（早期底层是UglifyJS实现的——只支持es5，已废弃，现在是terser——支持es6+），package.json中配置sideEffect，标记不要删除的内容，例如css
* **代码分割**：开启splitChunk分割node_modules代码、动态import + 魔法注释webpackChunkName分割指定js代码
* **懒加载/预加载**：动态import语法、魔法注释webpackPrefetch
* **PWA**：离线可访问技术，依赖workbox-webpack-plugin + serviceWorker


___代码可以分为两个层面，一种是第三方库（node_modules），另一种是自己的源代码，通过代码分割 + dll可以更细粒度的进行代码体积控制。___

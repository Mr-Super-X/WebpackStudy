/*
 * @Description:
 * @Tips: 亲，记得补全功能描述哦~  (ღ˘⌣˘ღ)
 * @Author: Mr.Mikey
 * @Contact: 1303232158@qq.com
 * @Date: 2022-04-19 14:25:22
 * @LastEditors: Mr.Mikey
 * @LastEditTime: 2022-04-21 19:02:00
 * @FilePath: \webpack-study\07.webpack-dll\src\main.js
 */
import './index.css';
import './test.less';
import $ from 'jquery';
import print from './print';

// 测试dll打包jquery
console.log($);

/*
  这段代码的作用就是声明需要热更的模块
  注意：如果使用eslint，需要安装babel-eslint，并修改
        package.json的eslintConfig设置
        "eslintConfig": {
          "parser": "babel-eslint"
        }
 */
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./print.js', () => {
    // 更新逻辑
    print(3, 4);
  });
}
// 以下方式效果同上，如果使用了eslint需要解决esmodule和commonjs的报错
/* if (module.hot) {
  module.hot.accept('./print.js', () => {
    // 更新逻辑
    print(3, 4);
  });
} */

const add = function add(x, y) {
  return x + y;
};

console.log(add(1, 2));

const promise = new Promise((resolve) => {
  setTimeout(() => {
    console.log('定时器执行完了');
    resolve();
  }, 1000);
});
console.log(promise);

// 测试将t.js单独打包
// import(/* webpackChunkName: 't' */ './t')
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((e) => console.log(e));

// 测试懒加载和预加载
// 注意：开启eslint-webpack-plugin后document关键字不能直接使用
// 需要在package.json中配置eslintConfig字段，添加env，打开browser（node关键字不能使用时同理）
// "eslintConfig": {
//   "env": {
//     "browser": true
//   }
// },
document.getElementById('btn').onclick = function () {
  import(/* webpackChunkName: 't', webpackPrefetch: true */ './t').then(
    (res) => {
      res.default();
    },
  );
};

// sw代码必须运行在服务器上，因此通过npm i serve -g来测试
// 安装后使用serve -s build命令来启动，build指的是代码目录
// 注册serviceWorker
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     // service-worker.js由WorkboxWebpackPlugin自动生成
//     navigator.serviceWorker
//       .register('./service-worker.js')
//       .then(() => {
//         console.log('serviceWorker注册成功');
//       })
//       .catch(() => {
//         console.log('serviceWorker注册失败');
//       });
//   });
// }

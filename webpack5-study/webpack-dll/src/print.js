/*
 * @Description:
 * @Tips: 亲，记得补全功能描述哦~  (ღ˘⌣˘ღ)
 * @Author: Mr.Mikey
 * @Contact: 1303232158@qq.com
 * @Date: 2022-04-20 12:52:38
 * @LastEditors: Mr.Mikey
 * @LastEditTime: 2022-04-20 19:15:06
 * @FilePath: \webpack-study\05.webpack代码分割\src\print.js
 */

console.log('print.js加载完了~~');
function print(a, b) {
  console.log('print', a * b);
  return a * b;
}

export default print;

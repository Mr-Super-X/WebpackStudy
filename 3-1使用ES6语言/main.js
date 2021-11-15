/* // 通过 ES6 模块化规范导入 show 函数
import { show } from './show';
// 执行 show 函数
show('Webpack'); */
import * as React from 'react';
import { Component } from 'react';
import { render } from 'react-dom';

class Button extends Component {
  render() {
    return <h1>Hello, Webpack</h1>
  }
}

render(<Button />, window.document.getElementById('app'));
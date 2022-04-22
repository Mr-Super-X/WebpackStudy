/**
 * 服务器代码
 * 启动服务指令：
 *    nodemon server.js
 */
const express = require('express')

const app = express()

// 设置强缓存时间为十分钟
app.use(express.static('build', {maxAge: 600000}))

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})



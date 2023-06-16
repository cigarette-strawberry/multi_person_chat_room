const http = require('http');
const fs = require('fs')
const path = require('path');
const mime = require('mime'); // 附加的mime模块有根据文件扩展名得出MIME类型的能力
const cache = {}; // cache是用来缓存文件内容的对象

/**
 * 发送文件数据及错误响应
 * @param response
 */
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'})
    response.write('Error 404: response not found')
    response.end()
}

/**
 * 先写出正确的HTTP头，然后发送文件的内容
 * @param response
 * @param filePath
 * @param fileContents
 */
function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'content-type': mime.getType(path.basename(filePath))})
    response.end(fileContents)
}

/**
 * 提供静态文件服务
 * @param response
 * @param cache
 * @param absPath
 */
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) { // 检查文件是否缓存在内存中
        sendFile(response, absPath, cache[absPath]) // 从内存中返回文件
    } else {
        fs.exists(absPath, function (exists) { // 检查文件是否存在
            if (exists) {
                fs.readFile(absPath, function (err, data) { // 从硬盘中读取文件
                    if (err) send404(response)
                    else {
                        cache[absPath] = data
                        sendFile(response, absPath, data) // 从硬盘中读取文件并返回
                    }
                })
            } else send404(response) // 发送HTTP 404响应
        })
    }
}

/**
 * 创建HTTP服务器的逻辑
 */
let server = http.createServer(function (request, response) { // 创建HTTP服务器，用匿名函数定义对每个请求的处理行为
    let filePath = false

    if (request.url === '/') filePath = 'public/index.html' // 确定返回的默认HTML文件
    else filePath = 'public' + request.url // 将URL路径转为文件的相对路径

    const absPath = './' + filePath
    serveStatic(response, cache, absPath) // 返回静态文件
})

/**
 * 启动HTTP服务器
 */
server.listen(3000, function () {
    console.log('Server listening on port 3000.')
})

const chatServer = require('./lib/chat_server') // 第一行加载一个定制的Node模块，它提供的逻辑是用来处理基于Socket.IO的服务端聊天功能的，我们在后文中再定义这个模块。
chatServer.listen(server) // 第二行启动Socket.IO服务器，给它提供一个已经定义好的HTTP服务器，这样它就能跟HTTP服务器共享同一个TCP/IP端口

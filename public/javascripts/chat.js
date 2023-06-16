/**
 * 将消息和昵称/房间变更请求传给服务器
 * @param socket
 * @constructor
 */
const Chat = function (socket) {
    this.socket = socket
}

/**
 * 发送聊天消息
 * @param room
 * @param text
 */
Chat.prototype.sendMessage = function (room, text) {
    const message = {
        room: room,
        text: text
    }
    this.socket.emit('message', message)
}

/**
 * 变更房间
 * @param room
 */
Chat.prototype.changeRoom = function (room) {
    this.socket.emit('join', {
        newRoom: room
    })
}

/**
 * 处理聊天命令
 * @param command
 * @returns {boolean}
 */
Chat.prototype.processCommand = function (command) {
    const words = command.split(' ')
    var command = words[0].substring(1, words[0].length).toLowerCase() // 从第一个单词开始解析命令
    let message = false
    switch (command) {
        case 'join':
            words.shift()
            const room = words.join(' ')
            this.changeRoom(room) // 处理房间的变换/创建
            break
        case 'nick':
            words.shift()
            const name = words.join(' ')
            this.socket.emit('nameAttempt', name) // 处理更名尝试
            break
        default:
            message = 'Unrecognized command.' // 如果命令无法识别，返回错误消息
            break
    }
    return message
}

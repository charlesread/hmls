'use strict'

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('socket %s connected', socket.id)
    socket.emit('handshake', {message: 'I came from the server via a websocket!'})
  })
}
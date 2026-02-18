/**
 * Socket.io server instance for real-time order status updates
 */
let io = null;

function setIO(serverIO) {
  io = serverIO;
  io.on('connection', (socket) => {
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });
    socket.on('join:admin', () => {
      socket.join('admin');
    });
    socket.on('join:kitchen', () => {
      socket.join('kitchen');
    });
    socket.on('join:delivery', () => {
      socket.join('delivery');
    });
  });
}

function getIO() {
  return io;
}

module.exports = { setIO, getIO };

const messageHandler = (io, socket) => {
  const createdMessage = (msg) => {
    // socket.broadcast.emit("newIncomingMessage", msg);
    socket.to(msg.roomName).emit("newIncomingMessage", msg);
  };
  socket.on("createdMessage", createdMessage);
};

export default messageHandler;

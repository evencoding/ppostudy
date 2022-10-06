const socketHandler = (io, socket) => {
  function publicRooms() {
    const {
      sockets: {
        adapter: { sids, rooms },
      },
    } = io;
    const publicRooms = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
        publicRooms.push(key);
      }
    });
    return publicRooms;
  }
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });

  socket.on("nickname", (nickname: string) => {
    socket["nickname"] = nickname;
  });

  socket.on("enter_room", ({ roomName }, done) => {
    socket.join(roomName);
    console.log(socket.rooms);
    socket.to(roomName).emit("welcome", socket.nickname);
  });

  socket.on("offer", async (offer, roomName) => {
    await socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomName) =>
      socket.to(roomName).emit("bye", socket.nickname)
    );
  });

  socket.on("createdMessage", ({ message, roomName }) => {
    socket.to(roomName).emit("new_Message", message, socket.nickname);
  });
};

export default socketHandler;

import { Server } from "socket.io";
import socketHandler from "@libs/sockets/socketHandler";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Define actions inside
  io.on("connection", (socket) => {
    console.log(`User Connected :${socket.id}`);

    // 1. When Rick joins a room or when Morty joins the same room. Event: join
    socket.on("join", (roomName) => {
      // Triggered when a peer hits the join room button.
      const { rooms } = io.sockets.adapter;
      const room = rooms.get(roomName);

      if (room === undefined) {
        socket.join(roomName);
        socket.emit("created");
      } else if (room.size === 1) {
        // room.size == 1 when one person is inside the room.
        socket.join(roomName);
        socket.emit("joined");
      } else {
        // when there are already two people inside the room.
        socket.emit("full");
      }
    });

    // 2. Morty tells the socket he's ready. Event: ready
    // Triggered when the person who joined the room is ready to communicate.
    socket.on("ready", (roomName) => {
      socket.broadcast.to(roomName).emit("ready"); // Informs the other peer in the room.
    });

    // 5. Rick and Morty will then be sending ICE Candidates to the socket. Event: ice-candidate
    // Triggered when server gets an icecandidate from a peer in the room.
    socket.on(
      "ice-candidate",
      (candidate: RTCIceCandidate, roomName: string) => {
        console.log(candidate);
        socket.broadcast.to(roomName).emit("ice-candidate", candidate);
      }
    );

    // 3. Rick will eventually create an Offer and send it to the socket. Event: offer
    // Triggered when server gets an offer from a peer in the room.
    socket.on("offer", (offer, roomName) => {
      socket.broadcast.to(roomName).emit("offer", offer);
    });

    // 4. Morty will then create an Answer and send it to the socket. Event: answer
    // Triggered when server gets an answer from a peer in the room.
    socket.on("answer", (answer, roomName) => {
      socket.broadcast.to(roomName).emit("answer", answer);
    });

    // 6. Rick or Morty might leave the room. Event: leave
    socket.on("leave", (roomName) => {
      socket.leave(roomName);
      socket.broadcast.to(roomName).emit("leave");
    });
  });

  console.log("Setting up socket");
  res.end();
}

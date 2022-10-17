import useUser from "@libs/client/useUser";
import { useEffect, useRef } from "react";
import io from "socket.io-client";
import Script from "next/script";

let socket;
let myVideoStream;
let peer;
const ROOM_ID = "정우";

export default function Ok() {
  const { user } = useUser();
  const myVideoRef = useRef(null);
  const SERVER_URL = "http://localhost:8000/";
  useEffect(() => {
    if (!user) return;
    socket = io(SERVER_URL, {
      transports: ["polling"],
    });
    console.log(socket);
    peer = new Peer({
      host: "127.0.0.1",
      port: 8000,
      path: "/peerjs",
      config: {
        iceServers: [
          { url: "stun:stun01.sipphone.com" },
          { url: "stun:stun.ekiga.net" },
          { url: "stun:stunserver.org" },
          { url: "stun:stun.softjoys.com" },
          { url: "stun:stun.voiparound.com" },
          { url: "stun:stun.voipbuster.com" },
          { url: "stun:stun.voipstunt.com" },
          { url: "stun:stun.voxgratia.org" },
          { url: "stun:stun.xten.com" },
          {
            url: "turn:192.158.29.39:3478?transport=udp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808",
          },
          {
            url: "turn:192.158.29.39:3478?transport=tcp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808",
          },
        ],
      },

      debug: 3,
    });
    peer.on("open", (id) => {
      socket.emit("join-room", ROOM_ID, user?.id, user?.name);
    });
  }, [user]);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {});
  }, []);
  return (
    <>
      <Script src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></Script>
      <div></div>
    </>
  );
}

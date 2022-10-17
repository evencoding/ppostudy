import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import useUser from "@libs/client/useUser";
import { cls } from "@libs/client/utils";

let socket;
let roomName: string = "";
let myStream;
let myPeerConnection;

type Message = {
  author: string;
  message: string;
};

export default function Room() {
  const { user } = useUser();
  const router = useRouter();

  // For Chat
  const { register, handleSubmit, reset } = useForm<Message>();
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);

  // For video
  const videoRef = useRef<HTMLVideoElement>(null);
  const peersVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraOptions, setCameraOptions] = useState([]);
  const [toggleVideo, setToggleVideo] = useState(true);
  const done = (msg) => {};
  useEffect(() => {
    if (!router.isReady) return;
    roomName = router.query.id.toString();
    if (!user) return;
    setUsername(user?.name);
  }, [router.isReady, user]);
  useEffect(() => {
    if (!roomName || !username) return;
    socketInitializer();
  }, [roomName, username]);
  useEffect(() => {
    getMedia();
  }, []);
  const makeConnection = () => {
    // Make a Peer-to-Peer Connection
    myPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.1.google.com:19302",
            "stun:stun1.1.google.com:19302",
            "stun:stun2.1.google.com:19302",
            "stun:stun3.1.google.com:19302",
            "stun:stun4.1.google.com:19302",
          ],
        },
      ],
    });
    myPeerConnection.addEventListener("icecandidate", (data) => {
      socket.emit("ice", data?.candidate, roomName);
    });
    myPeerConnection.addEventListener("track", (data) => {
      peersVideoRef.current.srcObject = data?.streams[0];
    });
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
  };
  const socketInitializer = async () => {
    await fetch("/api/socket");

    socket = io();

    socket.emit("nickname", username);

    socket.emit("enter_room", { roomName }, done);

    // Running Peer A
    socket.on("welcome", async (joinUsername, done) => {
      const offer = await myPeerConnection.createOffer();
      await myPeerConnection.setLocalDescription(offer);
      await socket.emit("offer", offer, roomName);
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: "SYSTEM", message: `${joinUsername} joined!` },
      ]);
    });

    // Running Peer B
    socket.on("offer", async (offer) => {
      myPeerConnection.setRemoteDescription(offer);
      const answer = await myPeerConnection.createAnswer();
      myPeerConnection.setLocalDescription(answer);
      socket.emit("answer", answer, roomName);
    });

    // Running Peer A
    socket.on("answer", (answer) => {
      myPeerConnection.setRemoteDescription(answer);
    });

    socket.on("ice", (ice) => {
      myPeerConnection.addIceCandidate(ice);
    });

    socket.on("bye", (leftUsername) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: "SYSTEM", message: `${leftUsername} left ㅠㅠ` },
      ]);
      peersVideoRef.current.srcObject = null;
    });

    socket.on("new_Message", (msg, name) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: name, message: msg },
      ]);
    });
  };
  const onValid = ({ message }) => {
    socket.emit("createdMessage", { message, roomName });
    setMessages((currentMsg) => [...currentMsg, { author: "Me", message }]);
    reset();
  };
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      cameras.map((camera) => {
        setCameraOptions([
          ...cameraOptions,
          { value: camera.deviceId, innerText: camera.label },
        ]);
      });
    } catch (e) {}
  };
  const getMedia = async () => {
    try {
      myStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      videoRef.current.srcObject = myStream;
      await getCameras();
      makeConnection();
    } catch (e) {}
  };
  const videoControl = () => {
    setToggleVideo(!toggleVideo);
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
  };
  const cameraChange = async (value) => {};
  return (
    <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
        <p className="font-bold text-white text-xl">Room: {roomName}</p>
        <p className="font-bold text-white text-xl">
          Your username: {username}
        </p>
        <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
          <div className="h-full last:border-b-0 overflow-y-scroll">
            {messages.map((msg, i) => {
              return (
                <div
                  className={cls(
                    "w-full py-1 px-2 border-b border-gray-200",
                    msg.author === "SYSTEM" ? "text-red-500" : ""
                  )}
                  key={i}
                >
                  {msg.author} : {msg.message}
                </div>
              );
            })}
          </div>
          <form
            onSubmit={handleSubmit(onValid)}
            className="border-t border-gray-300 w-full flex rounded-bl-md"
          >
            <input
              {...register("message", { required: true })}
              type="text"
              placeholder="New message..."
              className="outline-none py-2 px-2 rounded-bl-md flex-1"
            />
            <div className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-purple-500 transition-all">
              <button className="group-hover:text-white px-3 h-full">
                Send
              </button>
            </div>
          </form>
        </div>
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-56 bg-slate-500"
          ></video>
          <video
            ref={peersVideoRef}
            autoPlay
            playsInline
            className="w-56 bg-slate-500"
          ></video>
          <select onChange={cameraChange}>
            {cameraOptions ? (
              cameraOptions.map((camera, i) => (
                <option key={i} value={camera.value}>
                  {camera.innerText}
                </option>
              ))
            ) : (
              <option value="None">No Camera</option>
            )}
          </select>
          <button
            onClick={videoControl}
            className="p-2 border-white border-2 rounded-xl cursor-pointer hover:scale-110 mt-3"
          >
            {toggleVideo ? "Turn off" : "Turn on"}
          </button>
        </div>
      </main>
    </div>
  );
}

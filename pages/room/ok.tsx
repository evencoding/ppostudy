import io from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useUser from "@libs/client/useUser";

let socket;
let roomName: string = "";
let myStream;
let myPeerConnection;
let myLocal;
let myRemote;
let p1Local;
let p1Remote;
let p2Local;
let p2Remote;
let p3Local;
let p3Remote;

export default function Room() {
  // For video
  const videoRef = useRef<HTMLVideoElement>(null);
  const peersVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraOptions, setCameraOptions] = useState([]);
  useEffect(() => {
    socketInitializer();
  }, []);
  useEffect(() => {
    getMedia();
  }, []);
  const makeConnection = () => {
    // Make a Peer-to-Peer Connection
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", (data) => {
      console.log("sent candidate");
      socket.emit("ice", data?.candidate, roomName);
    });
    myPeerConnection.addEventListener("track", (data) => {
      console.log("got an event from my peer");
      console.log("Peer's Stream", data?.streams[0]);
      console.log("My", myStream);
      peersVideoRef.current.srcObject = data?.streams[0];
    });
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
  };
  const socketInitializer = async () => {
    await fetch("/api/socket");

    socket = io();

    socket.emit("enter_room", { roomName });

    // Running Peer A
    socket.on("welcome", async (joinUsername, done) => {
      const offer = await myPeerConnection.createOffer();
      await myPeerConnection.setLocalDescription(offer);
      await socket.emit("offer", offer, roomName);
      console.log("sent the offer");
    });

    // Running Peer B
    socket.on("offer", async (offer) => {
      myPeerConnection.setRemoteDescription(offer);
      console.log("received the offer");
      const answer = await myPeerConnection.createAnswer();
      myPeerConnection.setLocalDescription(answer);
      socket.emit("answer", answer, roomName);
      console.log("sent the answer");
    });

    // Running Peer A
    socket.on("answer", (answer) => {
      console.log("received the answer");
      myPeerConnection.setRemoteDescription(answer);
    });

    socket.on("ice", (ice) => {
      console.log("received candidate");
      myPeerConnection.addIceCandidate(ice);
    });
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
    } catch (e) {
      console.log(e);
    }
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
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
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
        </div>
      </main>
    </div>
  );
}

import io from "socket.io-client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import useUser from "@libs/client/useUser";
import { cls } from "@libs/client/utils";

let socket;
let roomName: string = "";
const isMe = "YOU";

type Message = {
  author: string;
  message: string;
};

export default function Room() {
  const router = useRouter();
  const { user } = useUser();
  const [username, setUsername] = useState("");
  const { register, handleSubmit, reset } = useForm<Message>();
  const [messages, setMessages] = useState<Array<Message>>([]);
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
  const socketInitializer = async () => {
    // We just call it because we don't need anything else out of it
    await fetch("/api/socket");

    socket = io();

    socket.emit("nickname", username);

    socket.emit("enter_room", { roomName }, done);

    socket.on("welcome", (joinUsername) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: "SYSTEM", message: `${joinUsername} joined!` },
      ]);
    });

    socket.on("bye", (leftUsername) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: "SYSTEM", message: `${leftUsername} left ㅠㅠ` },
      ]);
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
    setMessages((currentMsg) => [...currentMsg, { author: isMe, message }]);
    reset();
  };
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
      </main>
    </div>
  );
}

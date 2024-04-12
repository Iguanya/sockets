import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from "react";

const socket = io.connect("http://127.0.0.1:3001");

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketId, setSocketId] = useState(null);

  const joinRoom = (selectedRoom) => {
    if (selectedRoom !== "") {
      setRoom(selectedRoom);
      socket.emit("join_room", selectedRoom);
    }
  }

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { message, room });
      setMessage("");
    }
  }

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    const handleMessage = (data) => {
      if (data.sender !== socketId) {
        setMessageReceived(data.message);
        setMessages(prevMessages => [...prevMessages, data.message]);
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [messages, socketId]);

  return (
    <div className="App">
      <div>
        <button onClick={() => joinRoom("single")}> Single player </button>
        <button onClick={() => joinRoom("multi")}> Multi player </button>
      </div>
      <input
        placeholder="Message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button onClick={sendMessage}> Send Message </button>
      <h1>Messages:</h1>
      <ul>
        {messages.map((msg, index) => (
          <ul key={index}>{msg}</ul>
        ))}
      </ul>
      <h1>Last Received Message:</h1>
      <p>{messageReceived}</p>
    </div>
  );
}

export default App;

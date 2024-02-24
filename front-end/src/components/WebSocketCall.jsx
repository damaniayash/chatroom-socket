import { useContext, useEffect, useState } from "react";
import UserContext from "../UserContext";
import "./WebSocketCall.css";

export default function WebSocketCall({ socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const user = useContext(UserContext);

  const handleText = (e) => {
    const inputMessage = e.target.value;
    setMessage(inputMessage);
  };

  const handleSubmit = () => {
    if (!message) {
      return;
    }
    socket.emit("data", { message, user });
    setMessage("");
  };

  const handleUpvote = (msgulid) => {
    socket.emit("upvote", { msgulid });
  };

  const handleDownvote = (msgulid) => {
    console.log(msgulid);
    socket.emit("downvote", { msgulid });
  };

  useEffect(() => {

    socket.emit("get_previous_messages");
    // ... rest of the code

    // Event listener for receiving previous messages
    socket.on("previous_messages", (previousMessages) => {
      // Update the state with the received messages
      setMessages(previousMessages);
    });

    socket.on("data", (data) => {
      setMessages([...messages, data]);
    });

    socket.on("upvote", (data) => {
      const messageIndex = messages.findIndex(
        (message) => message.ulid === data.ulid,
      );
      if (messageIndex !== -1) {
        const updatedMessages = [...messages];
        updatedMessages[messageIndex].upvote = data.upvote;
        setMessages(updatedMessages);
      }
    });

    socket.on("downvote", (data) => {
      const messageIndex = messages.findIndex(
        (message) => message.ulid === data.ulid,
      );
      if (messageIndex !== -1) {
        const updatedMessages = [...messages];
        updatedMessages[messageIndex].downvote = data.downvote;
        setMessages(updatedMessages);
      }
    });

    return () => {
      socket.off("data", () => {
        console.log("data event was removed");
      });
    };
  }, [socket, messages]);

  return (
    <div>
      <ul>
        {messages.map((msg, ind) => (
          <li key={ind}>
            <div className="message-container">
              <div className="user-message">
                <b>{msg.user.charAt(0).toUpperCase() + msg.user.slice(1)}</b>:{" "}
                {msg.message}
              </div>
              <div className="vote-buttons">
                <button onClick={() => handleUpvote(msg.ulid)}>
                  {msg.upvote} Up
                </button>
                <button onClick={() => handleDownvote(msg.ulid)}>
                  {" "}
                  {msg.downvote} Down
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="bottom-fixed-container">
        <input type="text" value={message} onChange={handleText} />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

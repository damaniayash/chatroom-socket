import WebSocketCall from "./components/WebSocketCall";
import UserContext from "./UserContext";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Chatroom() {
  const [socketInstance, setSocketInstance] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);
  const loggedInUserName = localStorage.getItem("activeUserName");
  console.log("loggedin user", loggedInUserName);
  const navigate = useNavigate();

  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  useEffect(() => {
    if (!loggedInUserName) {
      navigate("/login");
      return;
    }

    if (buttonStatus === true) {
      const socket = io("localhost:5001/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3001/",
        },
      });

      setSocketInstance(socket);

      socket.on("connect", (data) => {
        console.log(data);
      });

      setLoading(false);

      socket.on("disconnect", (data) => {
        console.log(data);
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [buttonStatus, loggedInUserName, navigate]);

  return (
    <div className="App">
      <h1>ChatRoom</h1>
      <UserContext.Provider value={loggedInUserName}>
        {!buttonStatus ? (
          <button onClick={handleClick}>Enter Chatroom</button>
        ) : (
          <>
            <button onClick={handleClick}>Exit Chatroom</button>
            <div className="line">
              {!loading && <WebSocketCall socket={socketInstance} />}
            </div>
          </>
        )}
      </UserContext.Provider>
    </div>
  );
}

export default Chatroom;

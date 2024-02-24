//import './App.css';
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserContext from "./UserContext";
import LoginSignup from "./LoginSignup";
import Chatroom from "./Chatroom";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <UserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/chatroom" element={<Chatroom />} />
            <Route path="/" element={<LoginSignup />} />
          </Routes>
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;

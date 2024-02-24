import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";
import UserContext from "./UserContext";

function LoginSignup() {
  const navigate = useNavigate();
  const { setLoggedInUser } = useContext(UserContext);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validatePassword = (pass) => {
    if (pass.length < 6) {
      return "Password should be at least 6 characters.";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password should contain at least one uppercase letter.";
    }
    return "";
  };

  const handleLoginSignup = async (e) => {
    e.preventDefault();

    setError("");

    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    const endpoint = isLogin ? "/login" : "/signup";
    const payload = isLogin
      ? {
          email,
          password,
        }
      : {
          name,
          email,
          password,
        };

    const response = await fetch(`http://localhost:5001${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(data);

    // UI error handling
    if (!response.ok) {
      setError(data.message || "An error occurred. Please try again.");
      return;
    }

    if (isLogin) {
      // Store the username for the active user. Here, I'm using localStorage.
      console.log(email);
      fetch(`http://localhost:5001/get-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          localStorage.setItem("activeUserName", String(data.name));
          localStorage.setItem("activeUserId", data.id);
          setLoggedInUser({
            id: data.id,
            name: data.name,
            email: email,
          });
        });
      localStorage.setItem("activeUserEmail", email);

      // Navigate to the Chatroom page
      navigate("/chatroom");
    } else {
      // Alert the user about successful signup
      alert("Sign up was successful. You can now log in.");
    }
  };

  return (
    <div className="login-signup-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleLoginSignup}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Switch to Sign Up" : "Switch to Login"}
      </button>
    </div>
  );
}

export default LoginSignup;

import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import './App.css';
import logo from './assets/logo.png';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include", // send cookies
      });
      const data = await res.json();
      if (data.success) {
        setUser(null);
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout error");
    }
  };

  return (
    <div>
      <header className="header">
        <img src={logo} alt="College Logo" className="logo" />
        <h1>College Event Booking</h1>
        {user && (
          <button
            className="logout-btn"
            onClick={handleLogout}
            style={{ marginLeft: "auto" }}
          >
            Logout
          </button>
        )}
      </header>
      <div className="container">
        {user ? <Dashboard user={user} /> : <Login onLogin={setUser} />}
      </div>
    </div>
  );
}

export default App;

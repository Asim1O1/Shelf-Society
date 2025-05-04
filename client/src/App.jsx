import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ToastNotification from "./components/ToastNotification";
import HomePage from "./components/home/homepage";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <ToastNotification />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

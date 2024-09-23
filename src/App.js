import React from "react";
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import LoginForm from "./Components/loginform/LoginForm";
import Home from "./Components/Home/HomePage";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

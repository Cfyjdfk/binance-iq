import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import Resources from "./components/Resources";
import LaunchpoolPage from "./components/LaunchpoolPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-binance-dark">
        <Navbar />
        <Routes>
          <Route path="/launchpool" element={<LaunchpoolPage />} />
          <Route path="/" element={
            <div className="flex flex-col px-6">
              <Hero />
              <img
                src="/SS/SS1.png"
                alt="Screenshot"
                className="w-full h-screen object-cover mx-auto"
              />
              <FAQ />
              <Resources />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

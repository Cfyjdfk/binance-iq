import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FAQ from './components/FAQ';
import Resources from './components/Resources';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-binance-dark">
      <Navbar />
      <Hero />
      <img src="/SS/SS1.png" alt="Screenshot" className="w-full h-screen object-cover mx-auto" />
      <FAQ />
      <Resources />
    </div>
  );
}

export default App;

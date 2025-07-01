import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/Navbar';
import LandingPage from './pages/LandingPage';
import NormalizePage from './pages/NormalizePage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <NavBar />
        <main className="pb-24 sm:pb-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/normalise" element={<NormalizePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 
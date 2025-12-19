import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Dashboard from './Pages/Dashboard';
import VideoCall from './Pages/VideoCall';
import TestChat from './Pages/TestChat';

const App=() =>{
  return(
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header/>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/video/:roomId" element={<VideoCall />} />
            <Route path="/test-chat" element={<TestChat />} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  )
}
export default App;
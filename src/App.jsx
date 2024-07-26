import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';
import BankDiceGame from './BankDiceGame';
import TVSetup from './TVSetup';
import TVDisplay from './TVDisplay';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex flex-col p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/game/:gameCode" element={<BankDiceGame />} />
          <Route path="/tv/:gameCode" element={<TVSetup />} />
          <Route path="/tv/:gameCode/play" element={<TVDisplay />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

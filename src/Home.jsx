import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewGame } from './firebaseFunctions';
import logo from "./assets/heist-logo.svg"

function Home() {
  const [creating, setCreating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this breakpoint as needed
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleCreateGame = async (isTV) => {
    setCreating(true);
    try {
      const gameId = await createNewGame(isTV);
      if (isTV) {
        navigate(`/tv/${gameId}`);
      } else {
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error("Error creating game: ", error);
      alert("Failed to create game. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <img src={logo} alt="Heist Logo" className="mb-10" />
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {!isMobile && (
          <button
            onClick={() => handleCreateGame(true)}
            disabled={creating}
            className="text-nowrap font-lato w-full text-white bg-red-600 text-3xl font-bold py-3 px-4 rounded-lg "
          >
            {creating ? 'Creating new game...' : 'New Game'}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => navigate('/join')}
            className="font-lato w-full text-white bg-red-600 text-3xl font-bold py-3 px-4 rounded-lg "
          >
            Join Game
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;

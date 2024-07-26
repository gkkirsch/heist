import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader, ArrowRight, AlertCircle } from 'lucide-react';
import logo from "./assets/heist-logo.svg";
import { setGameInfo, getGameInfo, hasStoredGameInfo } from './utils';

function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's stored game info and redirect if found
    if (hasStoredGameInfo()) {
      const { gameCode } = getGameInfo();
      navigate(`/game/${gameCode}`);
    }
  }, [navigate]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where('code', '==', gameCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Game not found. Check the code and try again.');
      } else {
        // Store the game code in local storage
        // Note: We're not storing the player ID here as it's typically generated when the player is added to the game
        setGameInfo(gameCode.toUpperCase(), null);
        navigate(`/game/${gameCode.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error joining game:", error);
      setError('Failed to join game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <div className="w-full max-w-md">
        <img src={logo} className="mb-8" alt="Heist Logo" />

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-red-600 text-center text-2xl uppercase tracking-widest"
              required
            />
            {error && (
              <div className="absolute -bottom-6 left-0 w-full text-red-500 text-sm flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={24} />
                INFILTRATING...
              </>
            ) : (
              <>
                JOIN HEIST
                <ArrowRight className="ml-2" size={24} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500">
          Don't have a code? Ask your fellow heist members for the secret key.
        </p>
      </div>
    </div>
  );
}

export default JoinGame;

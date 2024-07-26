// src/components/CreateGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader } from 'lucide-react';

const funnyWords = ['TACO', 'PIZZA', 'NINJA', 'DISCO', 'HIPPO', 'BANJO', 'KAZOO', 'IGLOO', 'LLAMA', 'YOYO'];

function CreateGame() {
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setGameCode(funnyWords[Math.floor(Math.random() * funnyWords.length)]);
  }, []);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const gameRef = doc(db, 'games', gameCode);
      await setDoc(gameRef, {
        code: gameCode,
        players: [],
        createdAt: new Date()
      });
      console.log('Game created:', { code: gameCode, id: gameCode });
      navigate(`/lobby/${gameCode}`);
    } catch (error) {
      console.error("Error creating game: ", error);
      alert('Failed to create game');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-blue-600">Create a Game</h2>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <p className="text-xl mb-4">Your game code is:</p>
        <div className="text-4xl font-bold text-center mb-8 bg-gray-100 py-4 rounded">
          {gameCode}
        </div>
        <button
          onClick={handleCreateGame}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded flex items-center justify-center transition duration-300"
        >
          {loading ? (
            <>
              <Loader className="animate-spin mr-2" size={24} />
              Creating...
            </>
          ) : (
            'Create Game'
          )}
        </button>
      </div>
    </div>
  );
}

export default CreateGame;

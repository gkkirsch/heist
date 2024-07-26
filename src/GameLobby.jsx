// GameLobby.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { Users, UserPlus, Hash, Play } from 'lucide-react';

const avatars = [
  '👨', '👩', '🧑', '👴', '👵', '👦', '👧', '👮', '👷', '💂', '🕵️', '👩‍⚕️',
  '👨‍🌾', '👩‍🍳', '👨‍🎓', '👩‍🎤', '👨‍🏫', '👩‍🏭', '👨‍💻', '👩‍💼', '👨‍🔬', '👩‍🔧', '👨‍🚀', '👩‍🚒'
];

function GameLobby() {
  const { gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const gameData = docSnapshot.data();
        setPlayers(gameData.players || []);
        setGameStarted(gameData.started || false);
        setLoading(false);
        if (gameData.started) {
          navigate(`/game/${gameCode}`);
        }
      } else {
        console.log("No such game!");
        navigate('/');
      }
    }, (error) => {
      console.error("Error listening to game document:", error);
    });

    return () => unsubscribe();
  }, [gameCode, navigate]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (playerName.trim() !== '' && selectedAvatar) {
      const gameRef = doc(db, 'games', gameCode);
      try {
        await updateDoc(gameRef, {
          players: arrayUnion({ name: playerName, avatar: selectedAvatar })
        });
        setPlayerName('');
        setSelectedAvatar('');
      } catch (error) {
        console.error("Error adding player:", error);
        alert('Failed to join game. Please try again.');
      }
    }
  };

  const handleStartGame = async () => {
    const gameRef = doc(db, 'games', gameCode);
    try {
      await updateDoc(gameRef, { started: true });
    } catch (error) {
      console.error("Error starting game:", error);
      alert('Failed to start game. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-purple-600">Game Lobby</h2>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center mb-4">
          <Hash className="mr-2 text-purple-500" size={24} />
          <p className="text-xl">Game Code: <strong>{gameCode}</strong></p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Users className="mr-2 text-purple-500" size={20} />
            Players:
          </h3>
          <ul className="space-y-1">
            {players.map((player, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">{player.avatar}</span>
                {player.name}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleAddPlayer} className="mt-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            required
          />
          <div className="mb-2 flex flex-wrap justify-center">
            {avatars.map((avatar, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`m-1 p-2 text-2xl ${selectedAvatar === avatar ? 'bg-purple-200 rounded' : ''}`}
              >
                {avatar}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center transition duration-300 mb-4"
          >
            <UserPlus className="mr-2" size={20} />
            Join Game
          </button>
        </form>
        <button
          onClick={handleStartGame}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center transition duration-300"
        >
          <Play className="mr-2" size={20} />
          Start Game
        </button>
      </div>
    </div>
  );
}

export default GameLobby;

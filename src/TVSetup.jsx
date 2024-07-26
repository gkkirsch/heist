import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AvatarSelection from "./AvatarSelection"
import { db } from './firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import logo from "./assets/heist-logo.svg"
import QRCode from 'qrcode.react';

function TVSetup() {
  const { gameCode } = useParams();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGameState(data);
        setLoading(false);

        // Check if the game has started and redirect if necessary
        if (data.gameStarted) {
          navigate(`/tv/${gameCode}/play`);
        }
      } else {
        console.log("No such game!");
        setLoading(false);
        navigate('/'); // Redirect to home if game not found
      }
    });

    return () => unsubscribe();
  }, [gameCode, navigate]);

  const startGame = async () => {
    if (gameState.players.length < 2) {
      alert('At least 2 players are required to start the game');
      return;
    }

    const gameRef = doc(db, 'games', gameCode);
    await updateDoc(gameRef, {
      gameStarted: true,
      currentPlayerIndex: 0,
      roundsLeft: gameState.numRounds || 10,
      waitingForDecisions: false,
      secretDecisions: {},
      bank: 0,
      totalRolls: 0
    });

    // The navigation will be handled by the useEffect hook
  };

  if (loading) {
    return <div className="h-full w-full flex justify-center items-center">
      <img src={logo} alt="Heist Logo" />
    </div>
  }

  const gameUrl = `${window.location.origin}/game/${gameCode}`;

  return (
    <div className="flex items-center gap-40 justify-center min-h-screen p-4 bg-black text-white w-full">
      <div className="flex flex-col max-w-xl w-1/2 ">
        <img src={logo} alt="Heist Logo" className="mb-8" />
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Game Code:</h2>
          <p className="text-6xl font-bold text-red-500">{gameCode}</p>
        </div>
        <button
          onClick={startGame}
          disabled={gameState.players.length < 2}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Heist
        </button>
      </div>
      <div className="flex justify-center max-w-xl mb-8 w-1/2">
        <QRCode value={gameUrl} size={556} bgColor="#ffffff" fgColor="#000000" />
      </div>

      <div className="fixed bottom-4 mb-8">
        <ul className="flex gap-8">
          {gameState.players.map((player, index) => (
            <li key={index} className="flex items-center text-4xl">
              <AvatarSelection
                avatar={player?.avatar}
                size={75}
                selectedAvatar={player?.avatar}
                setSelectedAvatar={() => { }}
              />
              <span className="ml-4 font-lato text-6xl font-bold">{player.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TVSetup;

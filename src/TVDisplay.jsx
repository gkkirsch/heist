import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { addCommas } from "./utils";
import { Crown, ArrowUp, CheckCircle, Loader, Medal, Trophy, DollarSign, AlertTriangle, Zap, Target } from 'lucide-react';
import AvatarSelection from "./AvatarSelection"
import logo from "./assets/heist-logo.svg"
import MoneyCountupAnimation from './MoneyCountupAnimation';
import siren from "./assets/siren.mp3"

const AnimatedRoundDisplay = ({ currentRound, totalRounds }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [currentRound]);

  return (
    <div className={`text-4xl font-bold text-red-500 mb-8 transition-all duration-1000 ease-in-out ${animate ? 'scale-150 text-yellow-400' : ''}`}>
      Round {currentRound} of {totalRounds}
    </div>
  );
};

export default function TVDisplay() {
  const { gameCode } = useParams();
  const [gameState, setGameState] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const alarmAudioRef = useRef(new Audio(siren)); // Adjust the path as needed

  useEffect(() => {
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const newGameState = doc.data();
        setGameState(prevState => {
          if (prevState && newGameState.lastRoll === 7 && prevState.lastRoll !== 7 && newGameState.totalRolls >= 3) {
            triggerFlashingEffect();
            alarmAudioRef.current.play();
          }
          if (prevState && newGameState.roundsLeft !== prevState.roundsLeft) {
            setCurrentRound(Math.abs(newGameState.roundsLeft - newGameState.numRounds - 1));
          }
          setLastRoll(newGameState.lastRoll);
          return newGameState;
        });
      } else {
        console.log("No such game!");
      }
    });

    return () => unsubscribe();
  }, [gameCode]);

  const triggerFlashingEffect = () => {
    setIsFlashing(true);
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      flashCount++;
      if (flashCount >= 8) {
        clearInterval(flashInterval);
        setIsFlashing(false);
      } else {
        setIsFlashing(prev => !prev);
      }
    }, 250);
  };

  if (!gameState) {
    return <div className="bg-black text-white text-center py-20 text-2xl">Preparing the heist...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...sortedPlayers.map(player => player.score));
  const allZeroPoints = maxScore === 0;

  return (
    <div className={`flex flex-col items-center bg-black text-white min-h-screen p-8 ${isFlashing ? 'bg-red-600' : ''}`}>
      <img src={logo} alt="Heist Logo" className="max-w-sm mb-4" />

      <AnimatedRoundDisplay currentRound={currentRound} totalRounds={gameState.numRounds} />

      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-semibold mb-2">Current Heist</h2>
        <MoneyCountupAnimation amount={gameState?.bank} duration={1000} />

        <p className="text-4xl font-bold flex items-center mt-4">
          <AvatarSelection
            avatar={currentPlayer?.avatar}
            size={50}
            selectedAvatar={currentPlayer?.avatar}
            setSelectedAvatar={() => { }}
            borderWidth={2}
          />
          <span className="ml-4">{currentPlayer?.name}'s Up</span>
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <table className="w-full">
          <tbody>
            {sortedPlayers.map((player, index) => {
              const pointsToFirst = index === 0 ? 0 : sortedPlayers[0].score - player.score;
              const showCrown = !allZeroPoints && index === 0;
              return (
                <tr
                  key={player.id}
                  className={`${player.id === currentPlayer?.id ? 'animate-pulse bg-gray-700' : ''} mb-2`}
                >
                  <td className="text-2xl px-8 py-4">
                    {index + 1}
                    {showCrown && <Crown className="inline ml-2 text-yellow-400" size={20} />}
                  </td>
                  <td className="text-lg px-8 py-4">
                    {player.hasBanked && (
                      <span className="text-yellow-400 flex items-center">
                        <CheckCircle className="mr-2" size={20} />
                        Banked
                      </span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <AvatarSelection
                        borderWidth={2}
                        avatar={player?.avatar}
                        size={40}
                        selectedAvatar={player?.avatar}
                        setSelectedAvatar={() => { }}
                      />
                      <span className="ml-8 text-xl font-semibold">{player?.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right font-bold text-green-400">
                    <MoneyCountupAnimation className="text-xl" amount={player.score} duration={1000} />
                  </td>
                  <td className="py-4 pr-8 text-right text-gray-400">
                    {index !== 0 && (
                      <span>
                        <ArrowUp className="inline mr-1 text-red-400" size={16} />
                        ${addCommas(pointsToFirst)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { addCommas } from "./utils";
import { Crown, ArrowUp, ArrowDown, Clock, CheckCircle, XCircle, Loader, Medal, Trophy, DollarSign, AlertTriangle, Zap, Target } from 'lucide-react';
import AvatarSelection from "./AvatarSelection"
import logo from "./assets/heist-logo.svg"
import MoneyCountupAnimation from './MoneyCountupAnimation';

const getWinnerPhrase = (name) => {
  const phrases = [
    "Winner, winner, chicken dinner!",
    "Show me the money!",
    "Ka-ching! You've hit the jackpot!",
    "Victory is mine!",
    "Cha-ching, baby!",
    `And the winner is... ${name}!`,
    "Gold medal status achieved!",
    "Congratulations, you're rolling in dough!",
    "Jackpot joyride!",
    "You nailed it, champ!",
    "Cash cow in the house!",
    "You're the top banana!",
    "Dollar dance, here we go!",
    "Money magnet, activated!",
    "Cashing in on success!"
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const getTitles = (players) => {
  if (!players || players.length === 0) return {};

  const breakMaster = players.reduce((prev, current) => (prev.break7s > current.break7s ? prev : current));
  const doubleKing = players.reduce((prev, current) => (prev.doubles > current.doubles ? prev : current));
  const luckyStarter = players.reduce((prev, current) => (prev.initial7s > current.initial7s ? prev : current));

  return {
    breakMaster: { player: breakMaster, title: "Master of Disaster" },
    doubleKing: { player: doubleKing, title: "Double Trouble King" },
    luckyStarter: { player: luckyStarter, title: "Lucky 7 Charmer" }
  };
};

export default function TVDisplay() {
  const { gameCode } = useParams();
  const [gameState, setGameState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGameState(doc.data());
      } else {
        console.log("No such game!");
      }
    });

    return () => unsubscribe();
  }, [gameCode]);

  if (!gameState) {
    return <div className="bg-black text-white text-center py-20 text-2xl">Preparing the heist...</div>;
  }

  if (!gameState.players.length) {
    navigate('/'); // Redirect to home if game not found
  }

  if (gameState.gameOver) {
    const winner = gameState.players.reduce((prev, current) => (prev.score > current.score ? prev : current));
    const titles = getTitles(gameState.players);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <img src={logo} alt="Heist Logo" className="max-w-sm mb-8" />
        <div className="text-center bg-gradient-to-br from-yellow-100 to-yellow-300 p-8 rounded-lg shadow-2xl max-w-3xl w-full mx-4 border-4 border-yellow-500 text-black">
          <div className="flex flex-col justify-center items-center mb-8">
            <Medal className="text-yellow-600 w-24 h-24 mb-4" />
            <h2 className="text-4xl font-bold text-yellow-600">{winner.name}</h2>
            <div className="flex my-3 items-center justify-center space-x-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              <p className="text-2xl text-green-500">
                {winner.score.toLocaleString()}
              </p>
            </div>
            <h2 className="text-2xl text-yellow-600">{getWinnerPhrase(winner.name)}</h2>
          </div>

          {Object.keys(titles).length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Special Titles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(titles).map(([key, { player, title }]) => (
                  <div key={key} className="bg-white bg-opacity-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-lg">{title}</h4>
                    <p>{player.name} ({player[key.toLowerCase().replace('king', 'doubles')]})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-bold mb-4">Final Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameState.players.sort((a, b) => b.score - a.score).map((player, index) => (
                <div key={index} className="bg-white bg-opacity-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">{index + 1}. {player.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center"><Trophy className="w-4 h-4 mr-1" /> Score: {player.score.toLocaleString()}</div>
                    <div className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Break 7s: {player.break7s}</div>
                    <div className="flex items-center"><Zap className="w-4 h-4 mr-1" /> Doubles: {player.doubles}</div>
                    <div className="flex items-center"><Target className="w-4 h-4 mr-1" /> Initial 7s: {player.initial7s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const currentRound = Math.abs(gameState.roundsLeft - gameState.numRounds - 1);
  const maxScore = Math.max(...sortedPlayers.map(player => player.score));
  const allZeroPoints = maxScore === 0;

  return (
    <div className="flex flex-col items-center bg-black text-white min-h-screen p-8">
      <img src={logo} alt="Heist Logo" className="max-w-sm mb-4" />

      <p className="text-xl text-red-500 font-bold mb-4">Round {currentRound} of {gameState.numRounds}</p>

      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-semibold mb-2">Current Heist</h2>
        <MoneyCountupAnimation amount={gameState?.bank} duration={1000} />

        {!gameState.waitingForDecisions && (
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
        )}
      </div>

      {gameState.waitingForDecisions && (
        <div className="w-full max-w-3xl mb-8">
          <h3 className="text-2xl font-semibold mb-4">Players are weighing their options....</h3>
          <div className="grid grid-cols-2 gap-4">
            {gameState.players.map((player) => (
              <div key={player?.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    <AvatarSelection
                      avatar={player?.avatar}
                      size={50}
                      selectedAvatar={player?.avatar}
                      setSelectedAvatar={() => { }}

                      borderWidth={2}
                    />
                  </span>
                  <span className="font-semibold">{player?.name}</span>
                </div>
                {player.hasBanked ? (
                  <span className="text-yellow-400 flex items-center">
                    <CheckCircle className="mr-2" size={20} />
                    Took the cash
                  </span>
                ) : gameState.secretDecisions && gameState.secretDecisions[player.id] ? (
                  <span className="text-green-400 flex items-center">
                    <CheckCircle className="mr-2" size={20} />
                    Ready
                  </span>
                ) : (
                  <span className="text-blue-400 flex items-center">
                    <Loader className="mr-2 animate-spin" size={20} />
                    Contemplating
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

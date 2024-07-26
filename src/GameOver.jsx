import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { Medal, Trophy, DollarSign, AlertTriangle, Zap, Target } from 'lucide-react';

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

export default function GameOver({ gameState, resetGame }) {
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  const detectSize = () => {
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize);
    return () => {
      window.removeEventListener('resize', detectSize);
    }
  }, []);

  if (!gameState || !gameState.gameOver || !gameState.players || gameState.players.length === 0) {
    return null;
  }

  const { players } = gameState;
  const winner = players.reduce((prev, current) => (prev.score > current.score ? prev : current));
  const titles = getTitles(players);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center bg-gradient-to-br from-yellow-100 to-yellow-300 p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 border-4 border-yellow-500 overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col justify-center items-center mb-4">
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
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">Special Titles</h3>
            <div className="flex flex-col space-y-2">
              {titles.breakMaster && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{titles.breakMaster.title}:</span>
                  <span>{titles.breakMaster.player.name} ({titles.breakMaster.player.break7s})</span>
                </div>
              )}
              {titles.doubleKing && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{titles.doubleKing.title}:</span>
                  <span>{titles.doubleKing.player.name} ({titles.doubleKing.player.doubles})</span>
                </div>
              )}
              {titles.luckyStarter && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{titles.luckyStarter.title}:</span>
                  <span>{titles.luckyStarter.player.name} ({titles.luckyStarter.player.initial7s})</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Player Statistics</h3>
          {players.map((player, index) => (
            <div key={index} className="mb-4 p-2 bg-white bg-opacity-50 rounded">
              <h4 className="font-semibold">{player.name}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center"><Trophy className="w-4 h-4 mr-1" /> Score: {player.score}</div>
                <div className="flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Break 7s: {player.break7s}</div>
                <div className="flex items-center"><Zap className="w-4 h-4 mr-1" /> Doubles: {player.doubles}</div>
                <div className="flex items-center"><Target className="w-4 h-4 mr-1" /> Initial 7s: {player.initial7s}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95 text-xl flex items-center justify-center mx-auto"
        >
          Play Again
        </button>
      </div>
      <ReactConfetti
        width={windowDimension.width}
        height={windowDimension.height}
        numberOfPieces={200}
        recycle={false}
        run={true}
        colors={['#FFD700', '#32CD32']} // Yellow and Green
        drawShape={ctx => {
          ctx.font = '32px Arial';
          ctx.fillText('$', 0, 0);
        }}
      />
    </div>
  );
}

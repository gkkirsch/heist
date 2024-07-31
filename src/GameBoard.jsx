import React, { useState, useEffect } from 'react';
import { addCommas } from "./utils";
import RollButtons from "./RollButtons.jsx";
import GameOver from "./GameOver.jsx";
import logo from "./assets/heist-logo.svg";
import AvatarSelection from "./AvatarSelection"
import { X } from 'lucide-react';

const BankButton = ({ onBank, isDisabled }) => (
  <button
    onClick={onBank}
    disabled={isDisabled}
    className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold w-full py-4 px-4 rounded mb-4 disabled:opacity-50"
  >
    Take it
  </button>
);

export default function GameBoard({
  gameState,
  currentPlayerId,
  handleRoll,
  handleBank,
  resetGame,
  exitGame
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log("GameBoard received new gameState:", gameState);
  }, [gameState]);

  const handleExplode = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    handleRoll(7);
  };

  if (!gameState || !Array.isArray(gameState.players)) {
    return <div className="text-white">Error: Game state not loaded or invalid</div>;
  }

  const currentPlayerIndex = gameState.players.findIndex(player => player.id === currentPlayerId);
  const isCurrentPlayerTurn = currentPlayerIndex === gameState.currentPlayerIndex;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentPlayerHasBanked = gameState.players[currentPlayerIndex].hasBanked;

  if (gameState.gameOver) {
    const playerScore = gameState.players.find(player => player.id === currentPlayerId)?.score || 0;
    const maxScore = Math.max(...gameState.players.map(player => player.score));
    const isWinner = playerScore === maxScore;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <h2 className="text-4xl font-bold mb-4">{isWinner ? "You Won!" : "Game Over"}</h2>
        <p className="text-2xl mb-8">Your Score: ${addCommas(playerScore)}</p>
        <button
          onClick={resetGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95 text-xl mb-4"
        >
          Play Again
        </button>
        <button
          onClick={exitGame}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95 text-xl"
        >
          Exit Game
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <button
        onClick={exitGame}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        aria-label="Exit game"
      >
        <X size={24} />
      </button>
      <div className="flex flex-col items-center">
        <img src={logo} className="px-20" alt="Heist Logo" />
        <p className="mb-8 text-red-600 uppercase font-bold">Round {Math.abs(gameState.roundsLeft - gameState.numRounds - 1)}</p>
      </div>
      <div className="self-end p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AvatarSelection
              borderWidth={2}
              avatar={currentPlayer?.avatar}
              size={40}
              selectedAvatar={currentPlayer?.avatar}
              setSelectedAvatar={() => { }}
            />
            <div>
              <h3 className="ml-4 text-2xl font-bold">
                {isCurrentPlayerTurn ? "Your turn to bag the cash." : `${currentPlayer?.name}'s Up`}
              </h3>
            </div>
          </div>
        </div>

        {gameState.totalRolls >= 3 && !currentPlayerHasBanked && (
          <BankButton
            onBank={() => handleBank(currentPlayerId)}
            isDisabled={gameState.roundBroke}
          />
        )}

        {isCurrentPlayerTurn && !currentPlayerHasBanked && (
          <RollButtons
            handleRoll={handleRoll}
            handleExplode={handleExplode}
            gameState={gameState}
            isCurrentPlayerTurn={isCurrentPlayerTurn}
            isAnimating={isAnimating}
          />
        )}

        {(!isCurrentPlayerTurn || currentPlayerHasBanked) && (
          <p className="text-md text-gray-400 mt-4">
            Waiting on {currentPlayer?.name}...
          </p>
        )}
      </div>
      {gameState.gameOver && (
        <GameOver gameState={gameState} resetGame={resetGame} />
      )}
    </div>
  );
}

import React from 'react';
import { addCommas } from "./utils";

export default function PlayerScores({ players, bankPoints, gameOver, roundBroke, initialRolls }) {
  // Check if players is undefined or not an array
  if (!players || !Array.isArray(players) || players.length === 0) {
    return <div>No players available</div>;
  }

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Determine the highest score
  const highestScore = sortedPlayers[0].score;

  return (
    <div className="mb-6 p-4 rounded-lg border-2 border-yellow-500">
      <h3 className="text-2xl font-bold text-yellow-500 mb-4">Scores:</h3>
      <ul className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const pointsNeeded = highestScore - player.score;
          return (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center text-xl font-semibold text-green-600">
                <span className="text-gray-600">{player.name}:</span>
                <span className="ml-2 text-xl font-bold">${addCommas(player.score)}</span>
                {pointsNeeded > 0 && (
                  <span className="ml-2 text-sm text-red-600">
                    -{addCommas(pointsNeeded)}
                  </span>
                )}
              </div>
              <button
                onClick={() => bankPoints(player.name)}
                disabled={gameOver || roundBroke || player.hasBanked || initialRolls}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-0"
              >
                Bank
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

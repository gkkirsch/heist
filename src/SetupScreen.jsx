import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { avatars } from "./avatars"
import AvatarSelection from "./AvatarSelection"
import { generateNickname } from "./firebase"

export default function SetupScreen({ exitGame, gameState, updateGameState, joinGame, startGame, currentPlayerId }) {
  const [playerName, setPlayerName] = useState('');
  const [playerNickname, setPlayerNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [isReturningPlayer, setIsReturningPlayer] = useState(false);
  const [isGeneratingNickname, setIsGeneratingNickname] = useState(false);

  useEffect(() => {
    if (currentPlayerId) {
      const currentPlayer = gameState.players.find(player => player.id === currentPlayerId);
      if (currentPlayer) {
        setIsReturningPlayer(true);
        setPlayerName(currentPlayer.name);
        setPlayerNickname(currentPlayer.nickname || '');
        setSelectedAvatar(currentPlayer.avatar);
      }
    }
  }, [currentPlayerId, gameState.players]);

  useEffect(() => {
    if (currentPlayerId) {
      const currentPlayer = gameState.players.find(player => player.id === currentPlayerId);
      if (currentPlayer) {
        setIsReturningPlayer(true);
        setPlayerName(currentPlayer.name);
        setSelectedAvatar(currentPlayer.avatar);
      }
    }
  }, [currentPlayerId, gameState.players]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (playerName.trim() === '') {
      alert('Please enter your name');
      return;
    }

    if (!playerNickname) {
      setIsGeneratingNickname(true);
      const generatedNickname = await generateNickname(playerName);
      setIsGeneratingNickname(false);
      setPlayerNickname(generatedNickname || playerName);
    }

    if (isReturningPlayer) {
      updateGameState({
        players: gameState.players.map(player =>
          player.id === currentPlayerId
            ? { ...player, name: playerName, nickname: playerNickname || player.nickname, avatar: selectedAvatar }
            : player
        )
      });
    } else {
      joinGame(playerName, selectedAvatar, playerNickname);
    }
  };

  const handleStartGame = () => {
    if (gameState.players.length < 2) {
      alert('At least 2 players are required to start the game');
      return;
    }
    startGame();
  };

  const isCreator = currentPlayerId === gameState.creatorId;

  return (
    <div className="mt-4 mb-6 space-y-4">
      {isReturningPlayer && (
        <button
          onClick={exitGame}
          className="fixed top-4 right-4 p-2 text-gray-400 hover:text-white"
          aria-label="Exit game"
        >
          <X size={24} />
        </button>
      )}
      {!isReturningPlayer && (
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-white mb-2">
              Select Your Avatar
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(avatars).map((avatar, index) => (
                <AvatarSelection
                  key={index}
                  avatar={avatar}
                  size={200}
                  index={index}
                  selectedAvatar={selectedAvatar}
                  setSelectedAvatar={setSelectedAvatar}
                  avatars={avatars}
                />
                // <button
                //   key={index}
                //   type="button"
                //   onClick={() => setSelectedAvatar(avatar)}
                //   className={`text-3xl p-2 rounded-lg ${selectedAvatar === avatar ? 'bg-white' : 'border border-white'}`}
                // >
                //   {avatar}
                // </button>
              ))}
            </div>
          </div>
          <div className="pt-8">
            <label htmlFor="playerName" className="block text-lg font-medium text-white">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="mt-1 block w-full p-3 border-2 border-black bg-black rounded-lg focus:outline-none focus:ring-2 text-white focus:ring-gray-500 transition duration-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold font-xl mt-4 font-lato py-3 px-6 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95"
            disabled={isGeneratingNickname}
          >
            {isGeneratingNickname ? 'Generating Nickname...' : 'Join Game'}
          </button>
        </form>
      )}
      {isReturningPlayer && (
        <div className="h-full flex flex-col items-center">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4 font-lato">
              Welcome {playerName},<br />
              You know the plan.<br />
              Snatch all the cash you can carry, but don't get pinched.
            </div>
          </div>
          {isCreator && (
            <button
              onClick={handleStartGame}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95 mt-4 text-xl"
            >
              Start Heist
            </button>
          )}
          {!isCreator && (
            <p className="mt-4 text-center text-gray-400">
              Waiting for the game creator to start the heist...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

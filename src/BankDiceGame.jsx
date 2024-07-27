import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, onSnapshot, updateDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import SetupScreen from "./SetupScreen";
import GameBoard from "./GameBoard";
import { getGameInfo, setGameInfo, clearGameInfo } from "./utils";
import logo from "./assets/heist-logo.svg"

export default function BankDiceGame() {
  const { gameCode } = useParams();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up game listener");
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log("Received game data:", data);
        setGameState(data);
        setLoading(false);

        // Check if the current player is still in the game
        const storedInfo = getGameInfo();
        if (storedInfo.playerId && !data.players.some(p => p.id === storedInfo.playerId)) {
          console.log("Player no longer in game, clearing stored info");
          clearGameInfo();
          setCurrentPlayerId(null);
        }
      } else {
        console.log("No such game!");
        setLoading(false);
        clearGameInfo();
        navigate('/'); // Redirect to home if game not found
      }
    });

    return () => unsubscribe();
  }, [gameCode, navigate]);

  useEffect(() => {
    const storedInfo = getGameInfo();
    if (storedInfo.gameCode === gameCode && storedInfo.playerId) {
      console.log("Found stored player info:", storedInfo);
      setCurrentPlayerId(storedInfo.playerId);
    }
  }, [gameCode]);

  const getLatestGameState = async () => {
    const gameRef = doc(db, 'games', gameCode);
    const docSnapshot = await getDoc(gameRef);
    return docSnapshot.exists() ? docSnapshot.data() : null;
  };

  const updateGameState = async (updates) => {
    console.log("Updating game state:", updates);
    const gameRef = doc(db, 'games', gameCode);
    try {
      await updateDoc(gameRef, updates);
      console.log("Game state updated successfully");
      return await getLatestGameState();
    } catch (error) {
      console.error("Error updating game state:", error);
      throw error;
    }
  };

  const exitGame = async () => {
    if (!currentPlayerId) return;

    const currentGameState = await getLatestGameState();
    const currentPlayer = currentGameState.players.find(player => player.id === currentPlayerId);
    if (!currentPlayer) return;

    try {
      const gameRef = doc(db, 'games', gameCode);
      await updateDoc(gameRef, {
        players: arrayRemove(currentPlayer)
      });

      clearGameInfo();
      navigate('/');
    } catch (error) {
      console.error("Error exiting game:", error);
      alert("Failed to exit game. Please try again.");
    }
  };

  const handleRoll = async (value) => {
    const currentGameState = await getLatestGameState();
    if (currentGameState.players[currentGameState.currentPlayerIndex].id !== currentPlayerId) {
      alert("It's not your turn!");
      return;
    }

    console.log("Rolling with value:", value);

    const updatedPlayers = [...currentGameState.players];
    const currentPlayer = { ...updatedPlayers[currentGameState.currentPlayerIndex] };
    let newBank = currentGameState.bank;
    let newTotalRolls = currentGameState.totalRolls + 1;
    let roundBroke = false;

    if (value === 7 && newTotalRolls > 3) {
      roundBroke = true;
      currentPlayer.break7s += 1;
    } else if (value === 7) {
      newBank += value * 10000;
      currentPlayer.normalRolls += 1;
    } else if (value === 'double') {
      newBank *= 2;
      currentPlayer.doubles += 1;
    } else {
      newBank += value * 1000;
      currentPlayer.normalRolls += 1;
    }

    updatedPlayers[currentGameState.currentPlayerIndex] = currentPlayer;

    const updates = {
      players: updatedPlayers,
      bank: newBank,
      totalRolls: newTotalRolls,
      roundBroke: roundBroke,
      lastRoll: value
    };

    console.log("Applying updates:", updates);
    const updatedGameState = await updateGameState(updates);

    if (roundBroke) {
      await endRound(updatedGameState);
    } else if (newTotalRolls >= 3) {
      await promptForDecisions(updatedGameState);
    } else {
      await moveToNextPlayer(updatedGameState);
    }
  };

  const promptForDecisions = async (currentGameState) => {
    const updates = {
      waitingForDecisions: true,
      secretDecisions: {}
    };
    await updateGameState(updates);
  };

  const makeDecision = async (playerId, decision) => {
    const currentGameState = await getLatestGameState();
    if (!currentGameState.waitingForDecisions) {
      alert("It's not time to make a decision!");
      return;
    }
    console.log("Player decision:", playerId, decision);
    const updatedSecretDecisions = {
      ...currentGameState.secretDecisions,
      [playerId]: decision
    };

    const updatedGameState = await updateGameState({ secretDecisions: updatedSecretDecisions });

    if (Object.keys(updatedSecretDecisions).length === updatedGameState.players.filter(p => !p.hasBanked).length) {
      await resolveSecretDecisions(updatedSecretDecisions, updatedGameState);
    }
  };

  const resolveSecretDecisions = async (currentSecretDecisions, currentGameState) => {
    const updatedPlayers = currentGameState.players.map(player => {
      const decision = currentSecretDecisions[player.id];
      if (decision === 'bank' && !player.hasBanked) {
        console.log("HERE IT IS", player.score, currentGameState.bank)
        return {
          ...player,
          score: player.score + currentGameState.bank,
          hasBanked: true
        };
      }
      return player;
    });

    const allBanked = updatedPlayers.every(player => player.hasBanked);

    const updates = {
      players: updatedPlayers,
      waitingForDecisions: false,
      secretDecisions: {},
      bank: allBanked ? 0 : currentGameState.bank,
    };

    try {
      const updatedGameState = await updateGameState(updates);

      if (allBanked) {
        await endRound(updatedGameState);
      } else {
        await moveToNextPlayer(updatedGameState);
      }
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  };

  const moveToNextPlayer = async (currentGameState) => {
    let nextPlayerIndex = (currentGameState.currentPlayerIndex + 1) % currentGameState.players.length;
    let loopCount = 0;

    while (
      (currentGameState.players[nextPlayerIndex].hasBanked ||
        currentGameState.secretDecisions[currentGameState.players[nextPlayerIndex].id] === 'bank') &&
      loopCount < currentGameState.players.length
    ) {
      nextPlayerIndex = (nextPlayerIndex + 1) % currentGameState.players.length;
      loopCount++;
    }

    if (loopCount === currentGameState.players.length) {
      // All players have banked or decided to bank, end the round
      await endRound(currentGameState);
    } else {
      await updateGameState({
        currentPlayerIndex: nextPlayerIndex,
      });
    }
  };

  const endRound = async (currentGameState) => {
    const updatedPlayers = currentGameState.players.map(player => ({
      ...player,
      hasBanked: false
    }));

    const updates = {
      players: updatedPlayers,
      roundsLeft: currentGameState.roundsLeft - 1,
      currentPlayerIndex: 0,
      bank: 0,
      roundBroke: false,
      totalRolls: 0,
      gameOver: currentGameState.roundsLeft <= 1,
      waitingForDecisions: false,
      secretDecisions: {}
    };

    await updateGameState(updates);
  };

  const joinGame = async (playerName, avatar) => {
    console.log("Joining game:", playerName, avatar);
    const playerData = {
      id: Date.now().toString(),
      name: playerName,
      avatar: avatar,
      score: 0,
      hasBanked: false,
      doubles: 0,
      initial7s: 0,
      break7s: 0,
      normalRolls: 0
    };

    const currentGameState = await getLatestGameState();
    const updates = {
      players: arrayUnion(playerData)
    };

    // If this is the first player, set them as the creator
    if (currentGameState.players.length === 0) {
      updates.creatorId = playerData.id;
    }

    await updateGameState(updates);

    setCurrentPlayerId(playerData.id);
    setGameInfo(gameCode, playerData.id);
  };

  const startGame = async () => {
    console.log("Starting game");
    const currentGameState = await getLatestGameState();
    await updateGameState({
      gameStarted: true,
      currentPlayerIndex: 0,
      roundsLeft: currentGameState.numRounds || 10,
      waitingForDecisions: false,
      secretDecisions: {},
      bank: 0,
      totalRolls: 0
    });
    console.log("Game started, state updated");
  };

  const resetGame = async () => {
    const currentGameState = await getLatestGameState();
    const updatedPlayers = currentGameState.players.map(player => ({
      ...player,
      score: 0,
      hasBanked: false,
      doubles: 0,
      initial7s: 0,
      break7s: 0,
      normalRolls: 0
    }));

    const updates = {
      players: updatedPlayers,
      gameStarted: false,
      currentPlayerIndex: 0,
      bank: 0,
      gameOver: false,
      roundsLeft: currentGameState.numRounds || 10,
      roundBroke: false,
      totalRolls: 0,
      waitingForDecisions: false,
      secretDecisions: {}
    };

    await updateGameState(updates);
    setShowMenu(false);
  };

  console.log("Rendering BankDiceGame. GameState:", gameState, "Loading:", loading, "CurrentPlayerId:", currentPlayerId);

  if (loading) {
    return <div className="h-full w-full flex justify-center items-center">
      <img src={logo} alt="Heist Logo" />
    </div>
  }

  if (!gameState) {
    return <div>Error: Game state not loaded</div>;
  }

  return (
    <div className="max-w-md my-auto mx-auto relative">
      {!gameState.gameStarted ? (
        <SetupScreen
          gameState={gameState}
          updateGameState={updateGameState}
          joinGame={joinGame}
          startGame={startGame}
          currentPlayerId={currentPlayerId}
          exitGame={exitGame}
        />
      ) : (
        <GameBoard
          gameState={gameState}
          currentPlayerId={currentPlayerId}
          handleRoll={handleRoll}
          makeDecision={makeDecision}
          resetGame={resetGame}
          exitGame={exitGame}
        />
      )}
    </div>
  );
}

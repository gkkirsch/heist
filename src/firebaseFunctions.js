import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const funnyWords = [
  'TACO', 'PIZZA', 'NINJA', 'DISCO', 'HIPPO', 'BANJO', 'KAZOO', 'IGLOO', 'LLAMA', 'YOYO',
  'BURP', 'TOOT', 'POOP', 'FART', 'SNOT', 'BARF', 'GOOP', 'SLOP', 'GUNK', 'YUCK',
  'BONK', 'ZONK', 'HONK', 'BOOP', 'ZOOP', 'FLOP', 'DERP', 'DURP', 'HERP', 'MERP',
  'BLOB', 'GOOP', 'SLIME', 'OOZE', 'GUNK', 'MUCK', 'YUCK', 'GICK', 'GACK', 'BLEK',
  'DORK', 'NERD', 'GEEK', 'WONK', 'DWEEB', 'NOOB', 'DUDE', 'BRUH', 'DAWG', 'HOMIE'
];

export const createNewGame = async (isTV = false) => {
  try {
    const gameCode = funnyWords[Math.floor(Math.random() * funnyWords.length)];
    const gameRef = doc(collection(db, 'games'), gameCode);

    await setDoc(gameRef, {
      code: gameCode,
      players: [],
      currentPlayer: 0,
      bank: 0,
      gameOver: false,
      roundsLeft: 10,
      showSetup: true,
      numPlayers: 2,
      numRounds: 5,
      roundBroke: false,
      initialRolls: true,
      rollCount: 0,
      createdAt: new Date(),
      isTV: isTV,
      gameStarted: false
    });

    return gameCode;
  } catch (error) {
    console.error("Error creating new game:", error);
    throw error;
  }
};

// gameReducer.js

export const initialGameState = {
  players: [],
  waitingForDecisions: false,
  secretDecisions: {},
  bank: 0,
  currentPlayerIndex: 0,
  roundsLeft: 10,
  gameOver: false,
  gameStarted: false,
  totalRolls: 0,
  roundBroke: false,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return {
        ...state,
        ...action.payload
      };
    case 'ROLL': {
      const { value, currentPlayerId } = action.payload;
      const playersAfterRoll = [...state.players];
      const currentPlayerIndex = playersAfterRoll.findIndex(player => player.id === currentPlayerId);
      const currentPlayer = { ...playersAfterRoll[currentPlayerIndex] };
      let newBank = state.bank;
      let newTotalRolls = state.totalRolls + 1;
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

      playersAfterRoll[currentPlayerIndex] = currentPlayer;

      return {
        ...state,
        players: playersAfterRoll,
        bank: newBank,
        totalRolls: newTotalRolls,
        roundBroke: roundBroke,
      };
    }
    case 'MAKE_DECISION':
      return {
        ...state,
        secretDecisions: {
          ...state.secretDecisions,
          [action.payload.playerId]: action.payload.decision
        }
      };
    case 'RESOLVE_DECISIONS': {
      const updatedPlayers = state.players.map(player => {
        const decision = state.secretDecisions[player.id];
        if (decision === 'bank' && !player.hasBanked) {
          return {
            ...player,
            score: player.score + state.bank,
            hasBanked: true
          };
        }
        return player;
      });
      return {
        ...state,
        players: updatedPlayers,
        waitingForDecisions: false,
        secretDecisions: {},
        bank: updatedPlayers.every(player => player.hasBanked) ? 0 : state.bank,
      };
    }
    case 'PROMPT_FOR_DECISIONS':
      return {
        ...state,
        waitingForDecisions: true,
        secretDecisions: {}
      };
    case 'END_ROUND':
      return {
        ...state,
        players: state.players.map(player => ({ ...player, hasBanked: false })),
        roundsLeft: state.roundsLeft - 1,
        currentPlayerIndex: 0,
        bank: 0,
        gameOver: state.roundsLeft <= 1,
        waitingForDecisions: false,
        secretDecisions: {}
      };
    case 'MOVE_TO_NEXT_PLAYER': {
      let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextPlayerIndex].hasBanked && nextPlayerIndex !== state.currentPlayerIndex) {
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
      }
      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
      };
    }
    case 'RESET_GAME':
      return {
        ...initialGameState,
        players: state.players.map(player => ({
          ...player,
          score: 0,
          hasBanked: false,
          doubles: 0,
          initial7s: 0,
          break7s: 0,
          normalRolls: 0
        })),
        numRounds: state.numRounds
      };
    default:
      return state;
  }
}

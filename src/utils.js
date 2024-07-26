export function addCommas(number) {
  if (number === undefined || number === null) {
    return '0';
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// New functions for local storage operations

export function setGameInfo(gameCode, playerId) {
  localStorage.setItem('gameCode', gameCode);
  localStorage.setItem('playerId', playerId);
}

export function getGameInfo() {
  return {
    gameCode: localStorage.getItem('gameCode'),
    playerId: localStorage.getItem('playerId')
  };
}

export function clearGameInfo() {
  localStorage.removeItem('gameCode');
  localStorage.removeItem('playerId');
}

export function hasStoredGameInfo() {
  return localStorage.getItem('gameCode') && localStorage.getItem('playerId');
}

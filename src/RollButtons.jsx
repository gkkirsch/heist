import React, { useState, useEffect, useCallback } from 'react';
import { Siren } from 'lucide-react';

export default function RollButtons({ handleRoll, gameState, isCurrentPlayerTurn, isAnimating }) {
  const buttons = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [touchedButton, setTouchedButton] = useState(null);

  const vibrateDevice = useCallback((duration) => {
    if ('vibrate' in navigator && isCurrentPlayerTurn) {
      navigator.vibrate(duration);
    }
  }, [isCurrentPlayerTurn]);

  const handleTouchStart = useCallback((value) => {
    setTouchedButton(value);
    vibrateDevice(50); // Short vibration on touch start
  }, [vibrateDevice]);

  const handleTouchEnd = useCallback((value) => {
    setTouchedButton(null);
    if (!isAnimating && isCurrentPlayerTurn && !gameState.gameOver && !gameState.roundBroke) {
      handleRoll(value);
      vibrateDevice(100); // Longer vibration on successful roll
    }
  }, [handleRoll, isAnimating, isCurrentPlayerTurn, gameState, vibrateDevice]);

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  const ButtonContent = ({ value, isHovered, isSpecialSeven }) => {
    const moneyValue = value === 7 && gameState?.totalRolls <= 3 ? 70000 : value * 1000;

    if (isSpecialSeven) {
      return (
        <div className="relative w-full h-full py-4">
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'} text-4xl`}>
            7
          </div>
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Siren className="text-red-500 animate-wiggle" size="32px" />
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full py-4">
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'} text-4xl`}>
          {value}
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} text-2xl`}>
          ${moneyValue.toLocaleString()}
        </div>
      </div>
    );
  };

  if (!gameState) {
    console.error("RollButtons: gameState is undefined");
    return null;
  }

  const isDisabled = !isCurrentPlayerTurn || gameState.gameOver || gameState.roundBroke || isAnimating;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {buttons.map((value) => {
        const [isHovered, setIsHovered] = useState(false);
        const isSpecialSeven = value === 7 && gameState.totalRolls >= 3;

        return (
          <button
            key={value}
            onTouchStart={() => handleTouchStart(value)}
            onTouchEnd={() => handleTouchEnd(value)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isDisabled}
            className={`relative text-white font-bold py-6 px-8 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 overflow-hidden text-4xl
              ${isSpecialSeven
                ? touchedButton === value ? 'bg-black' : 'bg-gray-700'
                : value === 7 && gameState.totalRolls <= 3
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-green-500 hover:bg-green-600'
              } ${touchedButton === value ? 'scale-95' : ''}`}
          >
            {isSpecialSeven && touchedButton !== value && (
              <div className="bg-red-500 absolute inset-0" />
            )}
            <ButtonContent value={value} isHovered={isHovered || touchedButton === value} isSpecialSeven={isSpecialSeven} />
          </button>
        );
      })}
      {gameState.totalRolls >= 3 && (
        <button
          onTouchStart={() => handleTouchStart('double')}
          onTouchEnd={() => handleTouchEnd('double')}
          disabled={isDisabled}
          className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-8 rounded-lg shadow-lg transform transition duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 text-xl col-span-3 ${touchedButton === 'double' ? 'scale-95' : ''}`}
        >
          Double
        </button>
      )}
    </div>
  );
}

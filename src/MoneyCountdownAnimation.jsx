import React, { useState, useEffect } from 'react';

const MoneyCountdownAnimation = ({ startAmount, onAnimationComplete }) => {
  const [currentAmount, setCurrentAmount] = useState(startAmount);

  useEffect(() => {
    if (currentAmount <= 0) {
      onAnimationComplete();
      return;
    }

    const decrementAmount = Math.max(Math.floor(currentAmount / 5), 1000); // Larger decrement
    const timeout = setTimeout(() => {
      setCurrentAmount(prevAmount => Math.max(prevAmount - decrementAmount, 0));
    }, 20); // Faster interval

    return () => clearTimeout(timeout);
  }, [currentAmount, onAnimationComplete]);

  return (
    <div className="text-5xl font-bold text-red-600 text-center py-4 animate-pulse">
      ${currentAmount.toLocaleString()}
    </div>
  );
};

export default MoneyCountdownAnimation;

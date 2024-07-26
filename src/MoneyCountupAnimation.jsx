import React, { useState, useEffect, useRef } from 'react';
import { addCommas } from "./utils";

const MoneyCountupAnimation = ({ className = "", amount, duration = 1000 }) => {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const previousAmount = useRef(amount);

  useEffect(() => {
    let startTime;
    let animationFrameId;

    const animateValue = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const currentValue = Math.floor(previousAmount.current + (amount - previousAmount.current) * progress);
        setDisplayAmount(currentValue);
        animationFrameId = requestAnimationFrame(animateValue);
      } else {
        setDisplayAmount(amount);
        previousAmount.current = amount;
      }
    };

    if (amount !== previousAmount.current) {
      animationFrameId = requestAnimationFrame(animateValue);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [amount, duration]);

  return (
    <div className={`text-6xl font-bold text-green-500 text-center py-4 ${className}`}>
      ${addCommas(displayAmount)}
    </div>
  );
};

export default MoneyCountupAnimation;

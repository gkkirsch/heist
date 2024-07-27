import React, { useState, useEffect } from 'react';

const DigitalDice = ({ onRoll, isRolling, setIsRolling }) => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);

  useEffect(() => {
    let intervalId;
    if (isRolling) {
      intervalId = setInterval(() => {
        setDice1(Math.floor(Math.random() * 6) + 1);
        setDice2(Math.floor(Math.random() * 6) + 1);
      }, 100);

      setTimeout(() => {
        clearInterval(intervalId);
        const finalDice1 = Math.floor(Math.random() * 6) + 1;
        const finalDice2 = Math.floor(Math.random() * 6) + 1;
        setDice1(finalDice1);
        setDice2(finalDice2);
        setIsRolling(false);
        onRoll(finalDice1 + finalDice2);
      }, 2000);
    }

    return () => clearInterval(intervalId);
  }, [isRolling, onRoll, setIsRolling]);

  const renderDice = (value) => {
    const dots = [];
    for (let i = 0; i < value; i++) {
      dots.push(<div key={i} className="w-2 h-2 bg-black rounded-full"></div>);
    }
    return dots;
  };

  return (
    <div className="flex justify-center space-x-4">
      <div className="w-16 h-16 bg-white rounded-lg flex flex-wrap justify-center items-center p-2">
        {renderDice(dice1)}
      </div>
      <div className="w-16 h-16 bg-white rounded-lg flex flex-wrap justify-center items-center p-2">
        {renderDice(dice2)}
      </div>
    </div>
  );
};

export default DigitalDice;

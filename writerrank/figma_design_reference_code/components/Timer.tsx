import { useState, useEffect } from 'react';

interface TimerProps {
  isActive: boolean;
  onTimeUp: () => void;
}

export function Timer({ isActive, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(180);
      return;
    }

    if (timeLeft === 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 30) return 'text-red-400';
    if (timeLeft <= 60) return 'text-[color:var(--ow-orange-500)]';
    return 'text-[color:var(--ow-neutral-50)]';
  };

  return (
    <div className={`font-mono text-lg ${getTimerColor()}`}>
      {formatTime(timeLeft)}
    </div>
  );
}
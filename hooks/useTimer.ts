import { useState, useEffect } from 'react';

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function useTimer(startTime?: string) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (startTime) {
      setIsRunning(true);
    }
  }, [startTime]);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMs = now.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      setElapsedSeconds(diffSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const formattedTime = formatTime(elapsedSeconds);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setElapsedSeconds(0);
    setIsRunning(false);
  };

  return {
    elapsedSeconds,
    elapsedMinutes,
    formattedTime,
    start,
    stop,
    reset,
    isRunning,
  };
}

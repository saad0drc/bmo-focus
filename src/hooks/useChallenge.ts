import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_CHALLENGE = 'bmo_challenge';
const STORAGE_KEY_CHALLENGE_COMPLETED = 'bmo_challenge_completed';

export interface ChallengeState {
  challenge: string;
  isCompleted: boolean;
  setChallenge: (challenge: string) => void;
  toggleComplete: () => void;
  clearChallenge: () => void;
}

export function useChallenge(): ChallengeState {
  const [challenge, setChallengeState] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const storedChallenge = localStorage.getItem(STORAGE_KEY_CHALLENGE);
    const storedCompleted = localStorage.getItem(STORAGE_KEY_CHALLENGE_COMPLETED);
    
    if (storedChallenge) setChallengeState(storedChallenge);
    if (storedCompleted) setIsCompleted(storedCompleted === 'true');
  }, []);

  const setChallenge = useCallback((newChallenge: string) => {
    setChallengeState(newChallenge);
    setIsCompleted(false);
    localStorage.setItem(STORAGE_KEY_CHALLENGE, newChallenge);
    localStorage.setItem(STORAGE_KEY_CHALLENGE_COMPLETED, 'false');
  }, []);

  const toggleComplete = useCallback(() => {
    setIsCompleted(prev => {
      const newState = !prev;
      localStorage.setItem(STORAGE_KEY_CHALLENGE_COMPLETED, String(newState));
      return newState;
    });
  }, []);

  const clearChallenge = useCallback(() => {
    setChallengeState('');
    setIsCompleted(false);
    localStorage.removeItem(STORAGE_KEY_CHALLENGE);
    localStorage.removeItem(STORAGE_KEY_CHALLENGE_COMPLETED);
  }, []);

  return {
    challenge,
    isCompleted,
    setChallenge,
    toggleComplete,
    clearChallenge
  };
}

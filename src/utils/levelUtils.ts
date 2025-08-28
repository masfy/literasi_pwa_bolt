import { Level } from '../types';

export const calculateLevel = (totalPoin: number, levels: Level[]): Level | null => {
  if (!levels.length) return null;
  
  const sortedLevels = levels.sort((a, b) => a.min_poin - b.min_poin);
  
  for (let i = sortedLevels.length - 1; i >= 0; i--) {
    const level = sortedLevels[i];
    if (totalPoin >= level.min_poin && (level.max_poin === -1 || totalPoin <= level.max_poin)) {
      return level;
    }
  }
  
  return sortedLevels[0];
};

export const getNextLevel = (currentLevel: Level, levels: Level[]): Level | null => {
  const sortedLevels = levels.sort((a, b) => a.min_poin - b.min_poin);
  const currentIndex = sortedLevels.findIndex(level => level.id === currentLevel.id);
  
  return currentIndex !== -1 && currentIndex < sortedLevels.length - 1 
    ? sortedLevels[currentIndex + 1] 
    : null;
};

export const calculateProgressToNextLevel = (totalPoin: number, currentLevel: Level, nextLevel: Level | null): number => {
  if (!nextLevel) return 100;
  
  const progressInCurrentLevel = totalPoin - currentLevel.min_poin;
  const totalPointsNeededForNext = nextLevel.min_poin - currentLevel.min_poin;
  
  return Math.min(100, Math.max(0, (progressInCurrentLevel / totalPointsNeededForNext) * 100));
};
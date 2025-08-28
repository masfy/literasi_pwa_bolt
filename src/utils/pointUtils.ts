export const calculatePoin = (durasi: number, ringkasan?: string): number => {
  let poin = durasi; // Base points = duration in minutes
  
  // Bonus points for detailed summary (>= 50 words)
  if (ringkasan && ringkasan.split(/\s+/).length >= 50) {
    poin += Math.floor(durasi * 0.2); // 20% bonus
  }
  
  return Math.max(1, poin); // Minimum 1 point
};
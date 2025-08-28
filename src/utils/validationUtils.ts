export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const countSentences = (text: string): number => {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
};

export const validateRingkasan = (ringkasan: string): boolean => {
  return countSentences(ringkasan) >= 2;
};

export const validateRefleksi = (refleksi: string): boolean => {
  return countSentences(refleksi) >= 1;
};

export const validateDurasi = (durasi: number): boolean => {
  return durasi > 0 && Number.isInteger(durasi);
};
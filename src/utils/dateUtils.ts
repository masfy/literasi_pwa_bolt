export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Makassar',
  }).format(date);
};

export const formatDateInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getCurrentDateMakassar = (): string => {
  const now = new Date();
  const makassarTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
  return formatDateInput(makassarTime);
};

export const isDateInFuture = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date(getCurrentDateMakassar());
  return inputDate > today;
};
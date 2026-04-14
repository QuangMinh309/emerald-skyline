export const formatDuration = (minutes: number): string => {
  if (!minutes) return '0p';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    const hourText = remainingMinutes === 0 ? `${hours}h` : `${minutes / 60}h`;
    return hourText;
  }

  return `${minutes}p`;
};
